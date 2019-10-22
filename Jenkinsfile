pipeline {
  agent any
  tools {
    maven 'Maven3'
    jdk 'JDK7'
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
            sh '''
                 echo "PATH = ${PATH}"
                echo "M2_HOME = ${M2_HOME}"
            '''
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
        withSonarQubeEnv('sonarqube') {
          sh 'mvn org.sonarsource.scanner.maven:sonar-maven-plugin:3.2:sonar'
        }
      }
    }
  }
}
