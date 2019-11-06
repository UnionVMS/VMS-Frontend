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
    POM_XML = ''
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
          if("${UPDATE_MODULE_VERSION}" == "true"){
            sh "mvn versions:set-property -Dproperty=unionvms.project.${MODULE_NAME}.module -DnewVersion=${MODULE_VERSION} -DgenerateBackupPoms=false" 
          } 
        }
      }
    }
    stage('commit pom.xml to github repo') {
      steps {
        script{

          POM_XML = sh(script:"git diff --name-only pom.xml", returnStdout: true).trim()

          if("${UPDATE_MODULE_VERSION}" == "true" && "${POM_XML}" == "pom.xml"){

            withCredentials([usernamePassword(credentialsId: 'github_uvmsci_user', passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
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
        slackSend(
          channel: '#jenkins',
          color: 'good',
          message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}"
      )
    }
    failure {
      slackSend(
          channel: '#jenkins',
          color: 'danger',
          message: "*${currentBuild.currentResult}:* Job ${env.JOB_NAME} build ${env.BUILD_NUMBER}\n More info at: ${env.BUILD_URL}"
      )
    }
  }
}
