pipeline {
  agent any
  tools {
    maven 'Maven3'
    jdk 'JDK8'
  }
  environment {
    //Use Pipeline Utility Steps plugin to read information from pom.xml into env variables
    IMAGE = readMavenPom().getArtifactId()
    VERSION = readMavenPom().getVersion()
  }
  stages {
    stage ('Init') {
        steps {
            echo "image: ${IMAGE}"
            echo "version: ${VERSION}"
        }
    }
    stage ('Build') {
      steps {
        sh 'mvn clean package' 
      }
    }
    stage('Results') {
      steps {
        echo "${VERSION}"
        archive 'target/*.war'
      }
    }
    stage('SonarQube analysis') {
      steps{ 
        withSonarQubeEnv('Sonarqube.com') {
          sh 'mvn $SONAR_MAVEN_GOAL -Dsonar.dynamicAnalysis=reuseReports -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_AUTH_TOKEN $SONAR_EXTRA_PROPS'
        }
      }
    }
    post { 
      always { 
        echo "team domain: ${env.SLACK_TEAM_DOMAIN}"
        echo "token: ${env.SLACK_TOKEN}"
        echo "slack channel: ${env.SLACK_CHANNEL}}"
        echo 'I will always say Hello again!'
      }
      success{
          slackSend(
          teamDomain: "${env.SLACK_TEAM_DOMAIN}",
            token: "${env.SLACK_TOKEN}",
            channel: "${env.SLACK_CHANNEL}",
            color: "danger",
            message: "${env.STACK_PREFIX} production deploy success: *${env.DEPLOY_VERSION}*. <${env.BUILD_URL}|Check build>"
        )
      }
      failure {
        slackSend(
          echo "team domain: ${env.SLACK_TEAM_DOMAIN}"
          echo "token: ${env.SLACK_TOKEN}"
          echo "slack channel: ${env.SLACK_CHANNEL}}"
          teamDomain: "${env.SLACK_TEAM_DOMAIN}",
            token: "${env.SLACK_TOKEN}",
            channel: "${env.SLACK_CHANNEL}",
            color: "danger",
            message: "${env.STACK_PREFIX} production deploy failed: *${env.DEPLOY_VERSION}*. <${env.BUILD_URL}|Check build>"
        )
      }
      cleanup{
        // Remove stuff from build process
      }
    }
  }
}
