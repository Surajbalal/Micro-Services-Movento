// def test(){
//       withCredentials([
//         file(credentialsId: 'auth-service.env', variable: 'AUTH_ENV_FILE'),
//         file(credentialsId: 'user-service.env', variable: 'USER_ENV_FILE'),
//         file(credentialsId: 'captain-service.env', variable: 'CAPTAIN_ENV_FILE'),
//         file(credentialsId: 'ride-service.env', variable: 'RIDE_ENV_FILE'),
//         file(credentialsId: 'payment-service.env', variable: 'PAYMENT_ENV_FILE'),
//         file(credentialsId: 'call-service.env', variable: 'CALL_ENV_FILE')
//     ]) {
    //  sh ''' 
    //           cd Micro-Services
    //             docker compose run --rm auth pnpm test
    //         docker compose run --rm user pnpm test
    //         docker compose run --rm captain pnpm test
    //         docker compose run --rm ride pnpm test
    //         docker compose run --rm payment pnpm test
    //         docker compose run --rm call-service pnpm test
    //         '''
    // }
// }
def test() {
    echo 'Tests temporarily disabled'
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
                        credentialsId: 'Docker-login',
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
def buildImage() {
    withCredentials([
        file(credentialsId: 'auth-service.env', variable: 'AUTH_ENV_FILE'),
        file(credentialsId: 'user-service.env', variable: 'USER_ENV_FILE'),
        file(credentialsId: 'captain-service.env', variable: 'CAPTAIN_ENV_FILE'),
        file(credentialsId: 'ride-service.env', variable: 'RIDE_ENV_FILE'),
        file(credentialsId: 'payment-service.env', variable: 'PAYMENT_ENV_FILE'),
        file(credentialsId: 'call-service.env', variable: 'CALL_ENV_FILE')
    ]) {
        sh '''
            cd Micro-Services
            docker compose build
        '''
    }
}
return this