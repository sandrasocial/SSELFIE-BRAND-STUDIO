# Build Optimization Documentation

## Overview

This project implements Vercel's Ignored Build Step feature to prevent unnecessary builds and reduce deployment costs. The build system now only triggers when files that actually affect the application have changed.

**Status**: ✅ Active and Optimized

## How It Works

### Ignored Build Step

The `build-check.sh` script runs before each Vercel deployment and:

1. **Checks for changes** in critical paths using `git diff HEAD^ HEAD --quiet -- ./path`
2. **Returns exit code 0** (skip build) if no relevant changes are detected
3. **Returns exit code 1** (proceed with build) if changes are found

### Monitored Paths

The following directories and files trigger a build when changed:

- `client/` - Frontend React application
- `server/` - Backend Node.js/Express application  
- `shared/` - Shared code between client and server
- `api/` - API routes and serverless functions
- `package.json` - Dependencies
- `package-lock.json` - Dependency lockfile
- `vercel.json` - Deployment configuration
- `vite.config.ts` - Build configuration
- `tsconfig.json` - TypeScript configuration
- `drizzle.config.ts` - Database configuration
- `Dockerfile` - Container configuration

### Ignored Paths

The following are ignored during deployment (via `.vercelignore`):

- Documentation files (`*.md` except README.md and replit.md)
- Test files and configurations
- Development tools and configs
- Cache and temporary files
- Large development assets
- GitHub Actions workflows

## Usage

### Force a Build

To override the optimization and force a build, include `[force-build]` or `force build` in your commit message:

```bash
git commit -m "Update documentation [force-build]"
```

### Manual Testing

Test the build check locally:

```bash
./build-check.sh
echo $?  # 0 = skip build, 1 = proceed with build
```

### Vercel Configuration

The optimization is configured in `vercel.json`:

```json
{
  "ignoreCommand": "bash build-check.sh"
}
```

## Benefits

1. **Cost Reduction**: Prevents unnecessary builds when only documentation or test files change
2. **Faster Deployments**: Skips build process for non-critical changes
3. **Efficient CI/CD**: Reduces build queue times and resource usage
4. **Smart Detection**: Automatically identifies when builds are actually needed

## Troubleshooting

### Build Not Triggered When Expected

1. Check if the changed files are in the monitored paths
2. Verify the script has execute permissions: `chmod +x build-check.sh`
3. Use `[force-build]` in commit message to override

### Build Triggered Unnecessarily  

1. Check if files in monitored paths were inadvertently modified
2. Review the script output to see which paths triggered the build
3. Consider adding the path to `.vercelignore` if it shouldn't trigger builds

### Script Errors

1. Ensure the repository has commit history (script needs `HEAD^`)
2. Check that git is available in the build environment
3. Verify bash is available (most Vercel environments support it)

## Monitoring

Monitor build frequency and costs in:
- Vercel dashboard usage metrics
- GitHub Actions workflow runs
- Deployment logs showing skip/build decisions

## Cost Impact

Before optimization: ~300 builds (every commit)
After optimization: Only builds when application code changes

Estimated cost reduction: 60-80% depending on development patterns