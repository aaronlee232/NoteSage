---
tags: [Notebook/projects/personal/NoteSage]
title: 2 - Database Design
created: '2023-07-05T00:14:43.147Z'
modified: '2023-07-05T02:33:26.318Z'
---

# 2 - Database Design

## Planned Tables

*fields are not part of MVP

user:
- id
- name
- email*
- password*
- isVerified*

page_section:
- id
- page_id (foreign key)
- content
- embedding

page
- id
- page_path - provide source of a page/page_section

tag
- id
- name - project-documentation/resume/notes/etc...

page_tag (Junction table of Page and Tag)
- id
- page_id
- tag_id

conversation
- id
- name
- user_id*
- messages[] - [role: message content, role: message content...]


## MVP Tables

- page
- tag
- page_tag
- page_section
- conversation

