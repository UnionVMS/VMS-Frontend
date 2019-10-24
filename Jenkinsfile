pipeline {
  agent any
  tools {
    maven 'Maven3'
    jdk 'JDK8'
  }
  environment {
    IMAGE = readMavenPom().getArtifactId()
    VERSION = readMavenPom().getVersion()
    BUILD_USER = ''
    POM_VERSION = ''
  }
  stages {
    stage ('Build') {
      steps {
        echo "temp no build"
        //sh 'mvn clean package' 
      }
    }
    stage('Results') {
      steps {
        echo "${VERSION}"
        archive 'target/*.war'
      }
    }
    stage('yaml test') {
      steps { 
        script {
          POM_VERSION = sh script: 'mvn help:evaluate -Dexpression=project.version -q -DforceStdout', returnStdout: true
          sh 'touch "/var/lib/jenkins/pom_version_test.yaml"'
          def filename = "/var/lib/jenkins/pom_version_test.yaml"
          def yaml = readYaml file: filename
          def amap = ['branch': "${env.BRANCH_NAME}",
                    'pwd': "${env.PWD}",
                    'pom_version': "${POM_VERSION}"]

          sh '''
            if [ -e /var/lib/jenkins/pom_version_test.yaml ]; then
              rm -f /var/lib/jenkins/pom_version_test.yaml
            fi
          '''
          writeYaml file: filename, data: amap
          def read = readYaml file: filename
          echo "${read}"

          sh "rm -f /var/lib/jenkins/pom_version_test.yaml"
        }
      }
    }
    stage('csv test') {
      steps { 
        script {
          POM_VERSION = sh script: 'mvn help:evaluate -Dexpression=project.version -q -DforceStdout', returnStdout: true
          sh 'touch "/var/lib/jenkins/pom_version_test.csv"'
          def csvfile = readCSV file: '/var/lib/jenkins/pom_version_test.csv'

          echo "${csvfile}" 

          def records = [['pom_version', "${POM_VERSION}"], ['pwd', "${env.PWD}"]]
          writeCSV file: '/var/lib/jenkins/pom_version_test.csv', records: records

          def csvfile2 = readCSV file: '/var/lib/jenkins/pom_version_test.csv'

          echo "${csvfile2}" 

          echo "/var/lib/jenkins/pom_version_test.csv"
          sh "rm -f /var/lib/jenkins/pom_version_test.csv"
        }
      }
    }
    stage('SonarQube') {
      steps{ 
        withSonarQubeEnv('Sonarqube.com') {
          sh 'mvn $SONAR_MAVEN_GOAL -Dsonar.dynamicAnalysis=reuseReports -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_AUTH_TOKEN $SONAR_EXTRA_PROPS'
        }
      }
    }
    stage('Trigger Branch Build') {
        steps {
            script {
                    echo "Triggering job for branch ${env.BRANCH_NAME}"
                    build job: "/var/lib/jenkins/workspace/UVMS-MovementRulesModule-APP/swe-dev", wait: false
                    echo "${env.PWD}"
            }
        }
    }
  }
  post { 
    success{
        echo "${env.PWD}"
        /*
        slackSend(
          channel: '#jenkins',
          color: 'good',
          message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}"
      )
      */
    }
    /*
    failure {
      slackSend(
          channel: '#jenkins',
          color: 'danger',
          message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}"
      )
    }
    */
  }
}
