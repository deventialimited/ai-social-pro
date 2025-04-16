pipeline {
    agent any

    environment {
        ENV_FILE_PATH      = '/var/lib/jenkins/jenkinsEnvs/ai-social-pro'
        DEPLOY_PATH        = '/var/lib/jenkins/ai-social-pro'
        FRONTEND_ENV_FILE  = 'project/.env'
        FRONTEND_DEPLOY_DIR = "${DEPLOY_PATH}/project"
        BACKEND_DEPLOY_DIR = "${DEPLOY_PATH}/backend"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(
                    branches: [[name: '*/main']],
                    userRemoteConfigs: [[
                        credentialsId: 'majidToken',
                        url: 'https://github.com/deventialimited/ai-social-pro.git'
                    ]]
                )
            }
        }

        stage('Prepare Environment Files') {
            steps {
                echo "Setting up environment files..."
                sh '''
                    mkdir -p backend
                    cp ${ENV_FILE_PATH}/.env backend/.env
                    echo "VITE_BASE_URL=https://api.oneyearsocial.com" > ${FRONTEND_ENV_FILE}
                '''
            }
        }

       stage('Install Dependencies & Build Locally') {
    dir('project') {
        catchError {
            sh '''
                rm -rf node_modules package-lock.json
                npm install --legacy-peer-deps
                npm run build
            '''
        }
    }
}


        stage('Sync to Deployment Directory') {
            steps {
                echo "Syncing build to deployment path..."
                sh "rsync -av --exclude='.git' --exclude='node_modules' ./ ${DEPLOY_PATH}"
            }
        }

        stage('Install Dependencies & Build in Deploy Dir') {
            steps {
                dir(FRONTEND_DEPLOY_DIR) {
                    sh 'npm install'
                    catchError(buildResult: 'FAILURE', stageResult: 'FAILURE') {
                        sh 'npm run build'
                    }
                }
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir(DEPLOY_PATH) {
                    sh 'npm ci'
                }
            }
        }

        stage('Restart Backend (PM2)') {
            steps {
                dir(BACKEND_DEPLOY_DIR) {
                    script {
                        def processRunning = sh(script: "pm2 list | grep backend", returnStatus: true) == 0
                        if (processRunning) {
                            sh 'pm2 stop backend || true'
                            sh 'pm2 delete backend || true'
                        }
                        sh 'pm2 start index.js --name backend --watch -f'
                        sh 'pm2 save'
                    }
                }
            }
        }

        stage('Cleanup Workspace') {
            steps {
                echo "Cleaning up Jenkins workspace..."
                deleteDir()
            }
        }
    }

    post {
        success {
            echo '✅ Deployment successful.'
        }
        failure {
            echo '❌ Deployment failed.'
        }
    }
}
