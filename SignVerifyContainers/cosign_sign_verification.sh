cosign generate-key-pair
#cosign sign-blob --key cosign.key TestAgent.txt 
# cosign sign-blob --key cosign.key TestAgent.txt > signature.txt  signature.txt/.sig both are not read by verification command. So hardcoding for now. 
#cosign verify-blob --key cosign.pub --signature signature.txt TestAgent.txt
#cosign verify-blob --key cosign.pub --signature addsignature TestAgent.txt
cosign sign --key cosign.key docker.io/bravosh/sknhello2  #Pushing signature to: index.docker.io/bravosh/sknhello2

cosign verify --key ../dummyDLT/cosign.pub docker.io/bravosh/sknhello2