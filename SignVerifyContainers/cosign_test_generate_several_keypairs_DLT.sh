# Sign and verify blob shell script

export COSIGN_PUBLIC_KEY_FILE=/mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT
echo $COSIGN_PUBLIC_KEY_FILE

echo "Generating key pair..."
cosign generate-key-pair
#mv cosign.pub cosign2.pub

#move public key to DummyDLT
#mv cosign.pub $COSIGN_PUBLIC_KEY
#mv cosign2.pub /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/
echo "public key moved to registry/DLT"
