/**
 * Version Update Script
 *
 * Automatically updates version strings across the project.
 * Reads the version from package.json and updates all configured files.
 *
 * Usage:
 *   node .claude/skills/release/scripts/update-version.cjs
 *
 * Customize the FILES_TO_UPDATE array for your project structure.
 */

const fs = require("fs");
const path = require("path");

// Read version from package.json (source of truth)
const packageJsonPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "..",
  "package.json",
);
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const version = packageJson.version;

console.log(`Updating version references to: ${version}`);

/**
 * Files to update with version patterns
 *
 * Each entry has:
 * - file: relative path from project root
 * - patterns: array of { search: RegExp, replace: string template }
 *
 * In replace strings, use $VERSION as placeholder for the version number
 */
const FILES_TO_UPDATE = [
  {
    file: "README.md",
    patterns: [
      // npm install command with version
      {
        search: /@your-scope\/project-name@[\d.]+/g,
        replace: "@your-scope/project-name@$VERSION",
      },
      // Version badge
      {
        search: /version-[\d.]+-blue/g,
        replace: "version-$VERSION-blue",
      },
    ],
  },
  // Add more files as needed for your project
  // {
  //   file: 'src/config.ts',
  //   patterns: [
  //     {
  //       search: /VERSION\s*=\s*['"][\d.]+['"]/g,
  //       replace: 'VERSION = \'$VERSION\'',
  //     },
  //   ],
  // },
];

// Process each file
const projectRoot = path.join(__dirname, "..", "..", "..", "..");

for (const config of FILES_TO_UPDATE) {
  const filePath = path.join(projectRoot, config.file);

  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${config.file} (file not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, "utf8");
  let updated = false;

  for (const pattern of config.patterns) {
    const newContent = content.replace(
      pattern.search,
      pattern.replace.replace("$VERSION", version),
    );

    if (newContent !== content) {
      content = newContent;
      updated = true;
    }
  }

  if (updated) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`Updated: ${config.file}`);
  } else {
    console.log(`No changes: ${config.file}`);
  }
}

console.log("\nVersion update complete!");
console.log(
  `\nDon't forget to update CHANGELOG.md manually with release notes.`,
);
