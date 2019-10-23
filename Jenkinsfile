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
        sh 'mvn clean package' 
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
		    POM_VERSION = sh script: 'mvn help:evaluate -Dexpression=project.version -q -DforceStdout', returnStdout: true
        echo "POM_VERSION: ${POM_VERSION}"
        sh touch "/var/lib/jenkins/pom_version_test.yaml"
        def filename = "/var/lib/jenkins/pom_version_test.yaml"
        def yaml = readYaml file: filename
			   
			  echo "yaml: ${yaml}"

        yaml.branch = "${env.BRANCH_NAME}"
        yaml.pwd = "${env.PWD}"
			  yaml.pom_version = "${POM_VERSION}"
			   
        writeYaml file: filename, data: yaml
			   
			  def read = readYaml file: filename

				echo "read: ${read}"
      }
    }
    stage('SonarQube') {
      steps{ 
        withSonarQubeEnv('Sonarqube.com') {
          sh 'mvn $SONAR_MAVEN_GOAL -Dsonar.dynamicAnalysis=reuseReports -Dsonar.host.url=$SONAR_HOST_URL -Dsonar.login=$SONAR_AUTH_TOKEN $SONAR_EXTRA_PROPS'
        }
      }
    }
  }
  post { 
    success{
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
