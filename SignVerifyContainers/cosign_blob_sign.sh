# Sign and verify blob shell script

export COSIGN_SIGN_REPO=/mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository
echo $COSIGN_SIGN_REPO

#echo "Starting to sign..."

#echo "Generating signature..."
#cosign generate-key-pair

#move public key to DummyDLT
#mv cosign.pub $COSIGN_PUBLIC_KEY
#mv cosign.pub /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/
#echo "public key moved to registry/DLT" 

#sign image sknhello
#cosign sign-blob --key cosign.key TestAgent2.txt

cosign sign-blob --key cosign.key --output-signature blob.sig TestAgent2.txt
mv blob.sig $COSIGN_SIGN_REPO

echo "blob signed!!"