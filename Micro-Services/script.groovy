df test(){
     sh ''' 
                docker compose run --rm auth pnpm test
            docker compose run --rm user pnpm test
            docker compose run --rm captain pnpm test
            docker compose run --rm ride pnpm test
            docker compose run --rm payment pnpm test
            docker compose run --rm call-service pnpm test
            '''
}
df buildImage(){
     sh 'docker compose build'
}
df dockerLogin(){
    withCredential([
                    usernamePassword(
                        credentialsId:'docker-login',
                        usernameVariable:'DOCKER_USER',
                        passwordVarabile:'DOCKER_PASSWORD'
                    )
                ]){
                    sh 'echo $DOCKER_PASSWORD | docker login -u $DOCKER_USER --DOCKER_PASSWORD-stdin'
                }
}
df pushImage(){
       sh 'docker compose push'
}
return this