# template

[![Test](../../actions/workflows/test.yaml/badge.svg)](../../actions/workflows/test.yaml)

This is both the origin and the emptiness.

---

## GitHub Initial Setup

```markdown
## To be configured by the user

- [ ] Set up Branch Protection Rules at [Settings/rules](../settings/rules)
- [ ] Enable "Automatically delete head branches" at [Settings](../settings)
- [ ] Review security settings at [Security](../security)

## Request to Copilot

Please handle the following tasks.

1. Please set up Dependabot version updates
    Add `.github/dependabot.yml`

    Use the following as a base, and add entries for any languages used in this repository:

    ```yaml
    # .github/dependabot.yml
    version: 2
    updates:
      # Automatically update GitHub Actions
      - package-ecosystem: github-actions
        directory: /
        schedule:
          interval: weekly
        assignees:
          - kotaoue
    ```

1. Please pin Action versions to commit SHAs
    Replace `uses:` tag references with pinned commit SHAs in all workflows:

    ```yaml
    # NG (tag reference)
    - uses: actions/checkout@v4

    # OK (pinned to commit SHA)
    - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.2.2
    ```

1. Please remove the "GitHub Initial Setup" section from the README and make it more organized.

1. Please rewrite the README based on the contents/name/About of this repository.
```
