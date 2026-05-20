export function maskName(
  name: string,
  id: number,
  viewedIds: ReadonlySet<number>
): string {
  if (viewedIds.has(id)) return name;
  if (!name) return "";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0][0] + "X".repeat(parts[0].length - 1);
  }

  const first = parts[0][0] + "X".repeat(parts[0].length - 1);
  const last = parts[1][0] + "X".repeat(parts[1].length - 1);
  return `${first} ${last}`;
}

export function maskDescription(
  description: string,
  name: string,
  id: number,
  viewedIds: ReadonlySet<number>
): string {
  if (viewedIds.has(id)) return description;
  if (!description || !name) return description;

  const maskedName = "*".repeat(name.length);
  let maskedDesc = description.replace(new RegExp(name, "gi"), maskedName);

  const firstName = name.split(" ")[0];
  if (firstName) {
    const maskedFirstName = "*".repeat(firstName.length);
    maskedDesc = maskedDesc.replace(
      new RegExp(`\\b${firstName}\\b`, "gi"),
      maskedFirstName
    );
  }

  return maskedDesc;
}
