pipeline {
    agent any

    environment {
        // Path to your environment file.
        ENV_FILE_PATH = '/var/lib/jenkins/jenkinsEnvs/ai-social-pro'
        DEPLOY_PATH = '/var/lib/jenkins/ai-social-pro'
        FRONTEND_ENV_FILE = 'project/.env' // Frontend env file path
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    extensions: [],
                    userRemoteConfigs: [[
                        credentialsId: 'majidToken',
                        url: 'https://github.com/deventialimited/ai-social-pro.git'
                    ]])
            }
        }

        stage('Copy Environment File') {
            steps {
                echo "Copying environment file to Backend folder..."
                sh 'mkdir -p backend'  // Ensure backend directory exists
                sh "cp ${ENV_FILE_PATH}/.env backend/.env"  // Copy the .env environment file to the backend
            }
        }

        stage('Create Frontend .env') {
            steps {
                echo "Creating frontend .env file with VITE_BASE_URL..."
                sh '''
                    echo "VITE_BASE_URL=https://api.oneyearsocial.com" > ${FRONTEND_ENV_FILE}
                '''  // Create .env in frontend with the necessary variable
            }
        }

        stage('Install Dependencies - Project') {
            steps {
                dir('project') {
                    sh 'npm install --legacy-peer-deps'
                }
            }
        }

        stage('Build - Project') {
            steps {
                dir('project') {
                    script {
                        try {
                            sh 'npm run build'
                        } catch (err) {
                            echo "Build failed: ${err}"
                            error("Build failure")
                        }
                    }
                }
            }
        }

        stage('Transfer Full Build to Deployment Directory') {
            steps {
                script {
                    // Use rsync to exclude both .git and node_modules directories
                    echo "Transferring full build code to ${DEPLOY_PATH}..."
                    sh "rsync -av --exclude='.git' --exclude='node_modules' ./ ${DEPLOY_PATH}"  // Exclude both .git and node_modules
                }
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                dir("${DEPLOY_PATH}/project") {
                    sh 'npm install'  // Install frontend dependencies in the deployment directory
                }
            }
        }

        stage('Build - Frontend') {
            steps {
                dir("${DEPLOY_PATH}/project") {
                    script {
                        try {
                            sh 'npm run build'  // Build the frontend in the deployment directory
                        } catch (err) {
                            echo "Frontend build failed: ${err}"
                            error("Frontend build failure")
                        }
                    }
                }
            }
        }

        stage('Clean Up Workspace') {
            steps {
                script {
                    // Clean up the workspace after the transfer
                    echo "Cleaning up workspace..."
                    sh 'rm -rf *'  // Remove all files in the workspace
                }
            }
        }

        stage('Install Dependencies - Backend') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                dir(DEPLOY_PATH) {
                    script {
                        echo "Running npm ci in deployment directory..."
                        sh 'npm ci'  // Run npm ci in the deployment path to install backend dependencies
                    }
                }
            }
        }

        stage('Start Backend') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                dir("${DEPLOY_PATH}/backend") {  // CD into the 'backend' directory
                    script {
                        // Check if the backend is already running
                        def processStatus = sh(script: 'pm2 list | grep backend', returnStatus: true)
                        
                        // If the process is running, stop it
                        if (processStatus == 0) {
                            sh 'pm2 stop backend || true'
                            sh 'pm2 delete backend || true'
                        }

                        // Start the backend process with PM2
                        echo "Starting backend with PM2 from ${DEPLOY_PATH}/backend..."
                        sh 'pm2 start index.js --name backend --watch -f'
                        
                        // Save PM2 process list to ensure persistence
                        sh 'pm2 save'
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful.'
        }
        failure {
            echo 'Deployment failed.'
        }
    }
}
