import adjectives from "../assets/adjectives.json";
import nouns from "../assets/nouns.json";

function capitalize(val: string) {
  if (!val) return "";
  return val.charAt(0).toUpperCase() + val.slice(1);
}

export function newRandomNamePair() {
  const randomAdjective = Math.round(Math.random() * 1124);
  const randomNoun = Math.round(Math.random() * 3260);

  return `${capitalize(adjectives[randomAdjective])} ${capitalize(nouns[randomNoun])}`;
}

export function generateInitials(name: string) {
  if (!name?.trim().length) return "?";

  const initials = name
    ?.trim()
    ?.replace(/[^a-zA-Z ]/g, "")
    ?.split(" ")
    .map((v) => (!v.length ? "" : v))
    .slice(0, 3)
    .reduce((acc, subname) => acc + subname[0], "");

  return initials?.replace("undefined", "");
}
