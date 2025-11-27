---
name: skill-creator
description: Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations.
---

# Skill Creator Guide

## What is a Skill?

A skill is a markdown file that extends Claude Code's capabilities by providing:

- Specialized knowledge and domain expertise
- Workflow automation instructions
- Tool integration guidance
- Project-specific conventions

## Skill Anatomy

### File Structure

```
.claude/skills/<skill-name>/
  SKILL.md           # Main skill definition (required)
  scripts/           # Helper scripts (optional)
    script1.cjs
    script2.ps1
  templates/         # Template files (optional)
    template1.md
```

### SKILL.md Format

```markdown
---
name: skill-name
description: Brief description shown in skill list. This skill should be used when...
---

# Skill Title

## Overview

High-level description of what this skill does.

## When to Use

Specific scenarios when this skill should be invoked.

## Instructions

Step-by-step guidance for Claude to follow.

## Examples

Concrete examples of skill usage.

## Troubleshooting

Common issues and solutions.
```

## Creating a New Skill

### 1. Plan the Skill

Before creating, answer:

- What problem does this skill solve?
- When should Claude use this skill?
- What knowledge or instructions are needed?
- Are helper scripts beneficial?

### 2. Create the Directory

```bash
mkdir -p .claude/skills/my-skill/scripts
```

### 3. Write SKILL.md

Start with the template:

```markdown
---
name: my-skill
description: [What this skill does]. This skill should be used when [trigger conditions].
---

# [Skill Name]

## Overview

[Describe the skill's purpose and capabilities]

## When to Use

This skill should be invoked when:

- [Condition 1]
- [Condition 2]

## Workflow

### Step 1: [First Step]

[Instructions]

### Step 2: [Second Step]

[Instructions]

## Best Practices

- [Practice 1]
- [Practice 2]

## Common Issues

### [Issue 1]

**Solution:** [How to fix]

### [Issue 2]

**Solution:** [How to fix]
```

### 4. Add Helper Scripts (Optional)

For automation, add scripts in the `scripts/` directory:

```javascript
// scripts/helper.cjs
const fs = require("fs");
// Script logic
```

### 5. Test the Skill

1. Verify SKILL.md syntax is valid
2. Test trigger conditions in Claude Code
3. Verify instructions are clear and complete

## Best Practices

### Writing Instructions

- Be specific and actionable
- Use numbered steps for workflows
- Include example commands
- Provide error handling guidance

### Skill Scope

- Focus on one domain or workflow
- Keep skills modular and reusable
- Avoid overlap with other skills

### Maintenance

- Update skills when workflows change
- Version control skill files
- Document skill dependencies

## Examples of Good Skills

### Release Skill

- Automates npm package releases
- Provides version sync workflow
- Includes troubleshooting guide

### Testing Skill

- Guides test writing
- Provides test patterns
- Includes coverage guidelines

### Documentation Skill

- Maintains doc standards
- Provides templates
- Ensures consistency

## Skill Discovery

Skills are automatically discovered when:

1. Located in `.claude/skills/` directory
2. Contains valid `SKILL.md` file
3. Has proper YAML frontmatter

Claude Code lists available skills with:

```
/skills
```
