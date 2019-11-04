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

            PROJECT_MOVEMENT_MODULE_VERSION = sh script:'mvn help:evaluate -Dexpression=unionvms.project.movement.module -q -DforceStdout', returnStdout: true
            echo "PROJECT_MOVEMENT_MODULE_VERSION: ${PROJECT_MOVEMENT_MODULE_VERSION}"
            sh "mvn versions:set-property -Dproperty=unionvms.project.${MODULE_NAME}.module -DnewVersion=${MODULE_VERSION} -DgenerateBackupPoms=false"	
            PROJECT_MOVEMENT_MODULE_VERSION_NEW = sh script:'mvn help:evaluate -Dexpression=unionvms.project.movement.module -q -DforceStdout', returnStdout: true
            echo "PROJECT_MOVEMENT_MODULE_VERSION_NEW: ${PROJECT_MOVEMENT_MODULE_VERSION_NEW}"

            pom = readMavenPom file: 'pom.xml'
            POM_MODULE_VERSION = pom.properties['unionvms.project.movement.module']

            writeMavenPom model: pom
            echo "pom: ${pom}"
			      echo "POM_MODULE_VERSION: ${POM_MODULE_VERSION}"
          } 
        }
      }
    }
    stage('commit pom.xml to github repo') {
      steps {
        script{

          if("${UPDATE_MODULE_VERSION}" == "true"){
            withCredentials([usernamePassword(credentialsId: 'github_uvmsci_user', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
              GIT_STATUS = sh "git status"  
              GIT_BRANCH = sh "git branch"
              
              sh "git show-ref"
              sh "git config user.name uvmsci"
              sh "git config user.email uvmsci@gmail.com"
              sh "git add pom.xml" 
              sh "git commit -m \"update pom.xml with module: ${MODULE_NAME} version: ${MODULE_VERSION}\" "
            //  sh "git remote add origin https://github.com/UnionVMS/VMS-Frontend.git"
              sh "git push -u origin HEAD:${env.GIT_BRANCH} https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/UnionVMS/VMS-Frontend.git"
            }
          }
          /*
          withCredentials([usernamePassword(credentialsId: 'git-pass-credentials-ID', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
    sh("git tag -a some_tag -m 'Jenkins'")
    sh('git push https://${GIT_USERNAME}:${GIT_PASSWORD}@<REPO> --tags')
}
*/

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
