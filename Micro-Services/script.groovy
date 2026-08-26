def test(){
     sh ''' 
              cd Micro-Services
                docker compose run --rm auth pnpm test
            docker compose run --rm user pnpm test
            docker compose run --rm captain pnpm test
            docker compose run --rm ride pnpm test
            docker compose run --rm payment pnpm test
            docker compose run --rm call-service pnpm test
            '''
}
def buildImage(){
     sh '''
       cd Micro-Services
     docker compose build
     '''
}
def dockerLogin(){
    withCredentials([
                    usernamePassword(
                        credentialsId: 'docker-login',
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]){
                    sh '''
            echo "$DOCKER_PASSWORD" | docker login \
                --username "$DOCKER_USER" \
                --password-stdin
        '''
                }
}
def pushImage(){
       sh '''
          cd Micro-Services
       
       docker compose push'
       '''
}
return this