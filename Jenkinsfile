def hasParams() {
    if(params != null ){
      UPDATE_MODULE_VERSION = true
      echo "params: ${params}"
      return true
    } 
    return false
}


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
    UPDATE_MODULE_VERSION = hasParams()
     
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

                    echo "UPDATE_MODULE_VERSION: ${UPDATE_MODULE_VERSION}"

                    POM_VERSION = sh script: 'mvn help:evaluate -Dexpression=project.version -q -DforceStdout', returnStdout: true
                    echo "POM_VERSION: ${POM_VERSION}"

                    PROJECT_MOVEMENT_MODULE_VERSION = sh script:'mvn help:evaluate -Dexpression=unionvms.project.movement.module -q -DforceStdout', returnStdout: true
                    echo "PROJECT_MOVEMENT_MODULE_VERSION: ${PROJECT_MOVEMENT_MODULE_VERSION}"
			              sh 'mvn versions:set-property -Dproperty=unionvms.project.movement.module -DnewVersion=${PROJECT_MOVEMENT_MODULE_VERSION} -DgenerateBackupPoms=false'			
		              	PROJECT_MOVEMENT_MODULE_VERSION_NEW = sh script:'mvn help:evaluate -Dexpression=unionvms.project.movement.module -q -DforceStdout', returnStdout: true
                    echo "PROJECT_MOVEMENT_MODULE_VERSION_NEW: ${PROJECT_MOVEMENT_MODULE_VERSION_NEW}"
                    
            }
        }
    }
  }
  post { 
    success{
      echo "in success"
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
