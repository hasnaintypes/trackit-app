import path from "path";
import fs from "fs";

export function renderTemplate(
  templateName: string,
  vars: Record<string, string>,
) {
  const templatePath = path.join(
    process.cwd(),
    "src",
    "lib",
    "email",
    "templates",
    `${templateName}.html`,
  );
  let html = fs.readFileSync(templatePath, "utf8");
  Object.entries(vars).forEach(([key, value]) => {
    html = html.replace(new RegExp(`{{${key}}}`, "g"), value);
  });
  return html;
}
