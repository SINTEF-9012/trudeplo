#generate key pair

openssl ecparam -genkey -name secp384r1 > private_key.pem

#show private key
openssl pkcs8 -topk8 -in private_key.pem -nocrypt

#public key, show
openssl ec -in private_key.pem -pubout > public_key.pem
cat public_key.pem

#sign, private key
openssl dgst -sha256 -sign private_key.pem TestAgent.txt > testkeypair.sig

#verify, public key
openssl dgst -sha256 -verify public_key.pem -signature testkeypair.sig TestAgent.txt 
#Verified OK

#COSIGN 
#generate certicates
