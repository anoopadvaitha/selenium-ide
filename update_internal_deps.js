const fs = require('fs')
const path = require('path')

const PACKAGES_DIR = path.join(__dirname, 'packages')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function getAllPackages() {
  const packages = {}
  const packageDirs = fs.readdirSync(PACKAGES_DIR)

  for (const dir of packageDirs) {
    const pkgPath = path.join(PACKAGES_DIR, dir, 'package.json')
    if (fs.existsSync(pkgPath)) {
      const pkg = readJson(pkgPath)
      packages[pkg.name] = pkg.version
    }
  }

  return packages
}

function updateDeps(deps, workspacePackages) {
  if (!deps) return
  for (const dep in deps) {
    if (workspacePackages[dep]) {
      const version = workspacePackages[dep]
      deps[dep] = `workspace:^${version}`
    }
  }
}

function updateAllPackages() {
  const workspacePackages = getAllPackages()

  for (const dir of fs.readdirSync(PACKAGES_DIR)) {
    const pkgPath = path.join(PACKAGES_DIR, dir, 'package.json')
    if (!fs.existsSync(pkgPath)) continue

    const pkg = readJson(pkgPath)

    updateDeps(pkg.dependencies, workspacePackages)
    updateDeps(pkg.devDependencies, workspacePackages)

    writeJson(pkgPath, pkg)
    console.log(`✔ Updated ${pkg.name}`)
  }
}

updateAllPackages()
