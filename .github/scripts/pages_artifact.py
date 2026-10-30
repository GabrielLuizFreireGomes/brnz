"""Merge one independently built application with the last successful Pages artifact."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tarfile
import tempfile


def gh(*args):
    return subprocess.check_output(['gh', *args], text=True)


def hashes(directory, exclude_app=False):
    return {p.relative_to(directory).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest()
            for p in directory.rglob('*') if p.is_file()
            and not (exclude_app and p.relative_to(directory).parts[0] == 'app')}


def assemble(target, archive, output):
    with tempfile.TemporaryDirectory(prefix='brnz-pages-merge-') as folder:
        previous = Path(folder) / 'previous'
        previous.mkdir()
        with tarfile.open(archive) as bundle:
            bundle.extractall(previous, filter='data')
        if not (previous / 'index.html').is_file() or not (previous / 'app/index.html').is_file():
            raise RuntimeError('Previous Pages artifact must contain both published applications.')
        if target == 'workspace':
            source = Path('app/dist').resolve()
            if not (source / 'index.html').is_file():
                raise RuntimeError('Build the workspace before preparing the deployment.')
            before = hashes(previous, exclude_app=True)
            merged = Path(folder) / 'merged'
            shutil.copytree(previous, merged, ignore=lambda directory, names: ['app'] if Path(directory) == previous else [])
            shutil.copytree(source, merged / 'app')
            if before != hashes(merged, exclude_app=True):
                raise RuntimeError('Landing files changed; refusing to publish.')
            output.mkdir(parents=True, exist_ok=True)
            if any(output.iterdir()):
                raise RuntimeError('Workspace output directory must be empty to avoid mixing landing builds.')
            shutil.copytree(merged, output, dirs_exist_ok=True)
            print(f'Workspace ready. Preserved {len(before)} landing files, byte for byte.')
        else:
            if not (output / 'index.html').is_file() or (output / 'app').exists():
                raise RuntimeError('Expected a fresh landing build without app/.')
            shutil.copytree(previous / 'app', output / 'app')
            if hashes(previous / 'app') != hashes(output / 'app'):
                raise RuntimeError('Workspace files changed; refusing to publish.')
            print('Landing ready. Preserved the published workspace, byte for byte.')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('target', choices=['workspace', 'landing'])
    parser.add_argument('--archive', type=Path)
    parser.add_argument('--output', type=Path, default=Path('dist'))
    args = parser.parse_args()
    if args.archive:
        assemble(args.target, args.archive, args.output.resolve())
        return
    repo = os.environ['GITHUB_REPOSITORY']
    runs = json.loads(gh('api', f'repos/{repo}/actions/runs?status=success&per_page=50'))['workflow_runs']
    for run in runs:
        if run['name'] not in ['Deploy', 'Publish workspace']:
            continue
        artifacts = json.loads(gh('api', f'repos/{repo}/actions/runs/{run["id"]}/artifacts'))['artifacts']
        if not any(a['name'] == 'github-pages' and not a['expired'] for a in artifacts):
            continue
        with tempfile.TemporaryDirectory(prefix='brnz-pages-download-') as directory:
            subprocess.run(['gh', 'run', 'download', str(run['id']), '--repo', repo,
                            '--name', 'github-pages', '--dir', directory], check=True)
            print(f'Preserving the successful Pages publication from run {run["id"]}.')
            assemble(args.target, Path(directory) / 'artifact.tar', args.output.resolve())
        return
    raise RuntimeError('No preserved Pages artifact found. Refusing to replace the other application.')


if __name__ == '__main__':
    main()
