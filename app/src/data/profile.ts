import { db, mutate, type User, type UserPreferences } from "./db";
import { currentUser } from "../core/session";

export const profileDefaults: UserPreferences = {
  theme: "light",
  accent: "indigo",
  density: "comfortable",
  cover: "mosaic",
  avatarShape: "rounded",
};
export const preferencesOf = (user: User): UserPreferences => ({
  ...profileDefaults,
  ...user.preferences,
});

export function saveMyProfile(input: {
  name?: string;
  email?: string;
  phone?: string;
  title?: string;
  bio?: string;
  photo?: string | null;
  preferences?: Partial<UserPreferences>;
}) {
  const user = currentUser();
  if (!user) throw new Error("Entre na sua conta para editar o perfil.");
  const name =
    input.name === undefined
      ? user.name
      : input.name.trim().replace(/\s+/g, " ");
  const email =
    input.email === undefined ? user.email : input.email.trim().toLowerCase();
  if (name.length < 2 || name.length > 80)
    throw new Error("O nome deve ter entre 2 e 80 caracteres.");
  if (email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    throw new Error("Informe um e-mail válido.");
  if (
    db().users.some(
      (other) => other.id !== user.id && other.email.toLowerCase() === email,
    )
  )
    throw new Error("Este e-mail já pertence a outro perfil.");
  if (
    (input.bio?.length ?? 0) > 180 ||
    (input.phone?.length ?? 0) > 25 ||
    (input.title?.length ?? 0) > 80
  )
    throw new Error("Confira o tamanho dos campos do perfil.");
  if (
    input.photo &&
    (!/^data:image\/jpeg;base64,/.test(input.photo) ||
      input.photo.length > 350_000)
  )
    throw new Error("Escolha outra imagem para a foto.");
  const options = {
    theme: ["light", "dark", "system"],
    accent: ["indigo", "blue", "violet", "teal"],
    density: ["comfortable", "compact"],
    cover: ["mosaic", "aurora", "minimal"],
    avatarShape: ["rounded", "circle"],
  };
  for (const [key, value] of Object.entries(input.preferences ?? {})) {
    if (!options[key as keyof typeof options]?.includes(value))
      throw new Error("Essa opção de aparência não está disponível.");
  }
  mutate((d) => {
    const target = d.users.find((item) => item.id === user.id)!;
    target.name = name;
    target.email = email;
    target.initials = name
      .split(" ")
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
    for (const key of ["phone", "title", "bio"] as const)
      if (input[key] !== undefined) target[key] = input[key]!.trim();
    if (input.photo !== undefined) {
      if (input.photo === null) delete target.photo;
      else target.photo = input.photo;
    }
    if (input.preferences)
      target.preferences = { ...preferencesOf(target), ...input.preferences };
  });
}
