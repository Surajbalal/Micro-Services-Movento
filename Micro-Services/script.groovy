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
def getChangedServices() {
    def changedFiles = sh(
        script:'git diff --name-only HEAD~1 HEAD',
        returnStdout: true
    ).trim().split('\n')

    def services = [
        'auth',
        'user',
        'captain',
        'gateway',
        'ride',
        'payment',
        'call-service'
    ]

    return services.findAll { service -> 
        changedFiles.any{
            it.startsWith("Micro-Services/${service}/")
        }
    }


}
def test() {
    echo 'Tests temporarily disabled'
echo 'Tests temporarily disabled - TEST'
}
def incrementVersion(){
    // sh 'npm version patch'
    // def packageJson = readJSON file: 'package.json'
    // def version = packageJson.version

    // env.IMAGE_VERSION = "${version}-${BUILD_NUMBER}"

    // echo "New version... ${version}"
    // echo "New image version... ${env.IMAGE_VERSION}"
    dir('Micro-Services'){
        sh '''
            for service in */; do
                if [ -f "$service/package.json" ]; then
                    cd "$service"
                    npm version patch
                    def packageJson = readJSON file: 'package.json'
                    def version = packageJson.version

                    env.IMAGE_VERSION = "${version}-${BUILD_NUMBER}"

                    echo "New version... ${version}"
                    echo "New image version... ${env.IMAGE_VERSION}"
                    cd ..
                fi
            done
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

        def changedServices = getChangedServices()

        echo "Changed services ${changedServices}"

        dir('Micro-Services'){
            changedServices.each{ service -> 
                echo "Building ${service}"
                sh docker compose build ${service}
            }

        }
        // sh '''
        //     cd Micro-Services
        //     docker compose build
        // '''
    }
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
def pushImage() {
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

            docker compose push
        '''
    }
}
def pushVersionUpdate(){
   sh '''
   git config user.name "jenkins"
   git config user.email "surajbalal786@gmail.com"
   '''

   sshagent(['github-ssh']){
    sh '''
        git push origin HEAD
        git push origin --tags
    '''
   }
}
return this