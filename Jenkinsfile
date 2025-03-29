pipeline {
    agent any

    environment {
        // Path to your environment file
        ENV_FILE_PATH = '/home/ubuntu/jenkinsEnvs/ai-social-pro/.env'
        DEPLOY_PATH = '/home/ubuntu/ai-social-pro'
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
                    ]]
                )
            }
        }

        stage('Copy Environment File') {
            steps {
                echo "Copying environment file to Backend folder..."
                sh 'mkdir -p backend'  // Ensure backend directory exists
                sh "cp ${ENV_FILE_PATH} backend/.env"  // Copy the environment file
            }
        }

        stage('Install Dependencies - Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm i --force --legacy-peer-deps'
                }
            }
        }

        stage('Build - Frontend') {
            steps {
                dir('frontend') {
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

        stage('Install Dependencies - Backend') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Start Backend') {
            when {
                expression { currentBuild.resultIsBetterOrEqualTo('SUCCESS') }
            }
            steps {
                dir('backend') {
                    script {
                        // Check if the backend is already running
                        def processStatus = sh(script: 'pm2 list | grep backend', returnStatus: true)
                        
                        // If the process is running, stop it
                        if (processStatus == 0) {
                            sh 'pm2 stop backend || true'
                            sh 'pm2 delete backend || true'
                        }

                        // Start the backend process with PM2
                        sh 'pm2 start index.js --name backend --watch -f'
                        
                        // Save PM2 process list to ensure persistence
                        sh 'pm2 save'
                    }
                }
            }
        }

        stage('Transfer Full Build to Deployment Directory') {
            steps {
                script {
                    // Transfer the full build code to the deployment path
                    echo "Transferring full build code to ${DEPLOY_PATH}..."
                    sh "cp -r . ${DEPLOY_PATH}"  // Copy all files to the deploy directory
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
