# This script starts the development servers for the Price Comparator App.

# --- Backend Setup ---
Write-Output "Setting up backend..."

# Absolute path to the backend directory
$backendDir = Join-Path $PSScriptRoot "backend"
$pythonExecutable = Join-Path -Path (Join-Path -Path (Join-Path -Path $backendDir -ChildPath "venv") -ChildPath "Scripts") -ChildPath "python.exe"
$requirementsFile = Join-Path $backendDir "requirements.txt"
$backendAppFile = Join-Path $backendDir "app.py"

# Check if the Python executable exists
if (-not (Test-Path $pythonExecutable)) {
    Write-Error "Python executable not found at $pythonExecutable. Please ensure the virtual environment is set up correctly."
    exit 1
}

# Install backend dependencies
Write-Output "Installing backend dependencies..."
& $pythonExecutable -m pip install -r $requirementsFile
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install backend dependencies."
    exit 1
}

# Start backend server
Write-Output "Starting backend server in a background job..."
Start-Job -ScriptBlock {
    param($python, $app)
    & $python $app
} -ArgumentList @($pythonExecutable, $backendAppFile) -Name "BackendServer"


Write-Output "Backend server started."

# --- Frontend Setup ---
Write-Output "Setting up frontend..."

# Check if npm is available
$npmExists = Get-Command npm -ErrorAction SilentlyContinue
if (-not $npmExists) {
    Write-Error "npm command not found. Please ensure Node.js and npm are installed and in your PATH."
    exit 1
}

# Install frontend dependencies
Write-Output "Installing frontend dependencies..."
Push-Location $PSScriptRoot
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to install frontend dependencies."
    Pop-Location
    exit 1
}

# Start frontend server
Write-Output "Starting frontend server in a background job..."
Start-Job -ScriptBlock {
    npm run dev
} -Name "FrontendServer"

Pop-Location

Write-Output "Frontend server started."

Write-Output ""
Write-Output "Development servers have been started in background jobs."
Write-Output "Use 'Get-Job' to see the status."
Write-Output "Use 'Receive-Job -Name BackendServer -Keep' to see backend output."
Write-Output "Use 'Receive-Job -Name FrontendServer -Keep' to see frontend output."
Write-Output "Use 'Stop-Job -Name <JobName>' to stop a server."
