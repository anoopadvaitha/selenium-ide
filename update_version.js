// 1. Find all package.json files in the folder packages
// 2. Update the version number in each package.json file to the version specified in the command line argument
const fs = require('fs')
const path = require('path')

/**
 * Validates command line arguments and returns the version
 * @returns {string} The version number from command line arguments
 */
function getVersionFromArgs() {
  const version = process.argv[2]
  if (!version) {
    console.error('Please provide a version number as an argument.')
    process.exit(1)
  }
  return version
}

/**
 * Gets all package names from the packages directory
 * @param {string} packagesDir - Path to the packages directory
 * @returns {Promise<string[]>} Array of package names
 */
function getPackageNames(packagesDir) {
  return new Promise((resolve, reject) => {
    fs.readdir(packagesDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        reject(err)
        return
      }

      const packageNames = []
      const promises = []

      files.forEach((file) => {
        if (file.isDirectory()) {
          const packageJsonPath = path.join(
            packagesDir,
            file.name,
            'package.json'
          )
          if (fs.existsSync(packageJsonPath)) {
            promises.push(
              new Promise((resolvePackage) => {
                fs.readFile(packageJsonPath, 'utf8', (err, data) => {
                  if (!err) {
                    try {
                      const packageJson = JSON.parse(data)
                      if (packageJson.name) {
                        packageNames.push(packageJson.name)
                      }
                    } catch (parseErr) {
                      console.warn(
                        `Could not parse ${packageJsonPath} for package name`
                      )
                    }
                  }
                  resolvePackage()
                })
              })
            )
          }
        }
      })

      Promise.all(promises).then(() => {
        resolve(packageNames)
      })
    })
  })
}

/**
 * Updates dependencies that reference internal packages
 * @param {Object} packageJson - The parsed package.json object
 * @param {string[]} internalPackageNames - Array of internal package names
 * @param {string} version - New version to set
 * @returns {boolean} Whether any dependencies were updated
 */
function updateInternalDependencies(
  packageJson,
  internalPackageNames,
  version
) {
  let updated = false
  const dependencyTypes = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
  ]

  dependencyTypes.forEach((depType) => {
    if (packageJson[depType]) {
      Object.keys(packageJson[depType]).forEach((depName) => {
        // Check if it's an internal package by name
        if (internalPackageNames.includes(depName)) {
          // If it's currently using workspace protocol, preserve it
          packageJson[depType][depName] = `workspace:${version}`
          updated = true
        }
      })
    }
  })

  return updated
}

/**
 * Updates the version in a single package.json file and its internal dependencies
 * @param {string} packageJsonPath - Path to the package.json file
 * @param {string} version - New version to set
 * @param {string[]} internalPackageNames - Array of internal package names
 */
function updatePackageJsonVersion(
  packageJsonPath,
  version,
  internalPackageNames
) {
  fs.readFile(packageJsonPath, 'utf8', (err, data) => {
    if (err) {
      console.error(`Error reading ${packageJsonPath}:`, err)
      return
    }

    try {
      // Parse the JSON data
      let packageJson = JSON.parse(data)

      // Update the version number
      packageJson.version = version

      // Update internal dependencies
      const depsUpdated = updateInternalDependencies(
        packageJson,
        internalPackageNames,
        version
      )

      // Write the updated JSON back to the file
      fs.writeFile(
        packageJsonPath,
        JSON.stringify(packageJson, null, 2),
        'utf8',
        (err) => {
          if (err) {
            console.error(`Error writing ${packageJsonPath}:`, err)
          } else {
            const depMessage = depsUpdated ? ' and internal dependencies' : ''
            console.log(
              `Updated version${depMessage} in ${packageJsonPath} to ${version}`
            )
          }
        }
      )
    } catch (parseErr) {
      console.error(`Error parsing JSON in ${packageJsonPath}:`, parseErr)
    }
  })
}

/**
 * Processes a single directory and updates its package.json if it exists
 * @param {string} packagesDir - Path to the packages directory
 * @param {string} dirName - Name of the directory to process
 * @param {string} version - Version to set
 * @param {string[]} internalPackageNames - Array of internal package names
 */
function processPackageDirectory(
  packagesDir,
  dirName,
  version,
  internalPackageNames
) {
  const packageJsonPath = path.join(packagesDir, dirName, 'package.json')

  // Check if package.json exists in the directory
  if (fs.existsSync(packageJsonPath)) {
    updatePackageJsonVersion(packageJsonPath, version, internalPackageNames)
  }
}

/**
 * Reads all directories in the packages folder and updates their package.json files
 * @param {string} version - Version to set in all package.json files
 */
async function updateAllPackageVersions(version) {
  const packagesDir = path.join(__dirname, 'packages')

  try {
    // First, get all internal package names
    const internalPackageNames = await getPackageNames(packagesDir)
    console.log(
      `Found ${internalPackageNames.length} internal packages:`,
      internalPackageNames
    )

    // Read all directories in the packages directory
    fs.readdir(packagesDir, { withFileTypes: true }, (err, files) => {
      if (err) {
        console.error('Error reading packages directory:', err)
        process.exit(1)
      }

      files.forEach((file) => {
        if (file.isDirectory()) {
          processPackageDirectory(
            packagesDir,
            file.name,
            version,
            internalPackageNames
          )
        }
      })
    })
  } catch (error) {
    console.error('Error getting package names:', error)
    process.exit(1)
  }
}

/**
 * Main function that orchestrates the version update process
 */
async function main() {
  const version = getVersionFromArgs()
  await updateAllPackageVersions(version)
}

// Run the main function
main()
