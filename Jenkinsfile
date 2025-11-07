pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main', url: 'https://github.com/dnshivanya/Solidex.git'
            }
        }

        stage('Setup Node.js') {
            steps {
                script {
                    // Check if Node.js is available in system PATH
                    def nodeVersion = bat(script: '@echo off && node --version', returnStdout: true).trim()
                    if (nodeVersion && !nodeVersion.contains('not recognized')) {
                        echo "Using system Node.js: ${nodeVersion}"
                    } else {
                        // Try to use Node.js tool if configured
                        try {
                            def nodejs = tool name: 'Node22', type: 'NodeJSInstallation'
                            env.NODEJS_HOME = nodejs
                            env.PATH = "${nodejs};${env.PATH}"
                            echo "Using Jenkins Node.js tool: ${nodejs}"
                        } catch (Exception e) {
                            error "Node.js is not installed. Please install Node.js on the system or configure it in Jenkins (Manage Jenkins > Global Tool Configuration > Node.js installations)."
                        }
                    }
                }
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm install'
                }
            }
        }

        stage('Install Dependencies - Backend') {
            steps {
                dir('backend') {
                    bat 'npm install'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat 'npm run build'
                }
            }
        }

        stage('Run Backend') {
            steps {
                dir('backend') {
                    bat 'npm start'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build and deployment successful!'
        }
        failure {
            echo '❌ Build failed. Please check logs.'
        }
    }
}
