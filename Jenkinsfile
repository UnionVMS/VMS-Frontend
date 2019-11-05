def hasParams() {
    if(params.MODULE_NAME != null && params.MODULE_VERSION != null ){
      echo "params: ${params}"
      MODULE_NAME = "${params.MODULE_NAME}"
      MODULE_VERSION = "${params.MODULE_VERSION}"
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
    MODULE_NAME = ''
    MODULE_VERSION = ''
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
    stage('Update pom') {
      steps {
        script {
          echo "UPDATE_MODULE_VERSION: ${UPDATE_MODULE_VERSION}"
          if("${UPDATE_MODULE_VERSION}" == "true"){
            POM_VERSION = sh script: 'mvn help:evaluate -Dexpression=project.version -q -DforceStdout', returnStdout: true
            echo "POM_VERSION: ${POM_VERSION}"

            sh "mvn versions:set-property -Dproperty=unionvms.project.${MODULE_NAME}.module -DnewVersion=${MODULE_VERSION} -DgenerateBackupPoms=false" 
         
          } 
        }
      }
    }
    stage('commit pom.xml to github repo') {
      steps {
        script{

          POM_XML = sh "git diff --name-only pom.xml"
          if("${UPDATE_MODULE_VERSION}" == "true" && "${POM_XML}" == "pom.xml"){
            withCredentials([usernamePassword(credentialsId: 'github_uvmsci_user', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
              sh "cat env.txt"
              sh "git show-ref"
              sh "git config user.name uvmsci"
              sh "git config user.email uvmsci@gmail.com"
              sh "git add pom.xml" 
              sh "git commit -m \"update pom.xml with module: ${MODULE_NAME} version: ${MODULE_VERSION}\" "
              sh "git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/UnionVMS/VMS-Frontend.git HEAD:${env.GIT_BRANCH}"
            }
          }
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
