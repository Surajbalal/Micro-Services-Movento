// hello
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
def createInitialDeployEnv() {

    def services = [
        'auth',
        'user',
        'captain',
        'gateway',
        'ride',
        'payment',
        'call-service'
    ]

    dir('Micro-Services') {

        def deployEnv = ''

        services.each { service ->

            dir(service) {

                def packageJson = readJSON file: 'package.json'
                def version = packageJson.version

                def envName = service.toUpperCase()
                    .replace('-', '_') + '_VERSION'

                def imageVersion = "${version}-${BUILD_NUMBER}"

                deployEnv += "${envName}=${imageVersion}\n"

                echo "${service}: ${imageVersion}"
            }
        }

        writeFile(
            file: 'deploy.env',
            text: deployEnv
        )

        echo "Created deploy.env:"
        sh 'cat deploy.env'
    }
}
def getChangedServices() {
    def changedServices = sh(
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
        changedServices.any{
            it.startsWith("Micro-Services/${service}/")
        }
    }


}
def test() {
    echo 'Tests temporarily disabled'
}
def incrementVersion(){
    // sh 'npm version patch'
    // def packageJson = readJSON file: 'package.json'
    // def version = packageJson.version

    // env.IMAGE_VERSION = "${version}-${BUILD_NUMBER}"

    // echo "New version... ${version}"
    // echo "New image version... ${env.IMAGE_VERSION}"

    // dir('Micro-Services'){
    //     sh '''
    //         for service in */; do
    //             if [ -f "$service/package.json" ]; then
    //                 cd "$service"
    //                 npm version patch
    //                 def packageJson = readJSON file: 'package.json'
    //                 def version = packageJson.version

    //                 env.IMAGE_VERSION = "${version}-${BUILD_NUMBER}"

    //                 echo "New version... ${version}"
    //                 echo "New image version... ${env.IMAGE_VERSION}"
    //                 cd ..
    //             fi
    //         done
    //     '''
    // }
       def changedServices = getChangedServices()
       dir('Micro-Services'){
        changedServices.each{ service ->
            echo "Incrementing version for ${service}"

            dir(service){
                sh 'npm version patch'
                def packageJson = readJSON file : 'package.json'
                def version = packageJson.version

                echo "New version for ${service}: ${version}"

                def envName = service.toUpperCase().replace('-','_')+'_VERSION'
                def imageVersion = "${version}-${BUILD_NUMBER}"
              echo "${envName}=${imageVersion}"

                sh """
                    cd ..
                    sed -i "s|^${envName}=.*|${envName}=${imageVersion}|" deploy.env
                """

            }

        }
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
                sh "docker compose --env-file deploy.env build ${service}"
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
          def changedServices = getChangedServices()

        echo "Pushing services: ${changedServices}"
        dir('Micro-Services'){
            changedServices.each{ service ->
               

                sh "docker compose --env-file deploy.env push ${service}"
                
            
        }

        }
        
        // sh '''
        //     cd Micro-Services
        //     docker compose push
        // '''
    }
}
def pushVersionUpdate(){
   sh '''
   git config user.name "jenkins"
   git config user.email "surajbalal786@gmail.com"

    git add Micro-Services/*/package.json
    git add Micro-Services/*/package-lock.json
    git add Micro-Services/deploy.env

    git commit -m "chore: update service versions" || true

    git remote set-url origin git@github.com:Surajbalal/Micro-Services-Movento.git
   '''

   sshagent(['github-ssh']){
    sh '''
        git push origin HEAD:main
        git push origin --tags
    '''
   }
}
def deployApplication(){
    def shellCmd = "bash ./server-cmds.sh"

    def ec2Instance = "ubuntu@13.63.12.108"
 withCredentials([
        file(credentialsId: 'auth-service.env', variable: 'AUTH_ENV_FILE'),
        file(credentialsId: 'user-service.env', variable: 'USER_ENV_FILE'),
        file(credentialsId: 'captain-service.env', variable: 'CAPTAIN_ENV_FILE'),
        file(credentialsId: 'ride-service.env', variable: 'RIDE_ENV_FILE'),
        file(credentialsId: 'payment-service.env', variable: 'PAYMENT_ENV_FILE'),
        file(credentialsId: 'call-service.env', variable: 'CALL_ENV_FILE')
    ]) {
    sshagent(['ec2-server-key']){
        sh "scp -o StrictHostKeyChecking=no Micro-Services/server-cmds.sh ${ec2Instance}:/home/ubuntu"
        sh "scp Micro-Services/docker-compose.yml ${ec2Instance}:/home/ubuntu"
        sh "scp Micro-Services/deploy.env ${ec2Instance}:/home/ubuntu"
        sh "scp \$AUTH_ENV_FILE ${ec2Instance}:/home/ubuntu/auth-service.env"
        sh "scp \$USER_ENV_FILE ${ec2Instance}:/home/ubuntu/user-service.env"
        sh "scp \$CAPTAIN_ENV_FILE ${ec2Instance}:/home/ubuntu/captain-service.env"
        sh "scp \$RIDE_ENV_FILE ${ec2Instance}:/home/ubuntu/ride-service.env"
        sh "scp \$PAYMENT_ENV_FILE ${ec2Instance}:/home/ubuntu/payment-service.env"
        sh "scp \$CALL_ENV_FILE ${ec2Instance}:/home/ubuntu/call-service.env"
        sh "ssh -o strictHostKeyChecking=no ${ec2Instance} ${shellCmd} "
    }
    }
}
return this