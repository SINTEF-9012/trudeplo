# Sign and verify blob shell script

export COSIGN_PUBLIC_KEY_FILE=/mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT
echo $COSIGN_PUBLIC_KEY_FILE

export COSIGN_SIGNATURE_FILE=/mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT
echo $COSIGN_SIGNATURE_FILE

export COSIGN_SIGN_REPO=/mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/SignRepository
echo $COSIGN_SIGN_REPO

#verify image from DummyDLT
#BLOB 1
#cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign.pub --signature MEQCIEbxaMFjVN0gP7T8ozRFKhQAUYOCsoWnxgE77OBxtBRzAiBVLp+YZXiPFGwQnH6D+EBBh994Uc2zv8eonQWM9Fa9HA== TestAgent.txt

#BLOB 2
#cosign verify-blob --key $COSIGN_PUBLIC_KEY_FILE/cosign2.pub --signature MEUCIQCCjwVXXBDnQJJedrOc4CMrurW46AAdU4EbQZdMfzAyzgIge5xawWIII0qQjFRuuaf4/gxyuQFsj0EbV35TeLYTLRc= TestAgent1.txt
cosign verify-blob --key $COSIGN_PUBLIC_KEY_FILE/cosign2.pub --signature $COSIGN_SIGN_REPO/blob.sig TestAgent2.txt
#cosign verify-blob --key /mnt/c/Users/shukunt/git/trudeplo/SignVerifyContainers/dummyDLT/cosign2.pub --signature MEUCIQCCjwVXXBDnQJJedrOc4CMrurW46AAdU4EbQZdMfzAyzgIge5xawWIII0qQjFRuuaf4/gxyuQFsj0EbV35TeLYTLRc= TestAgent1.txt
echo "NOTE: Signature hardocoded, but image verified" 

#cosign sign-blob --key cosign.key TestAgent.txt > signature.txt  signature.txt/.sig both are not read by verification command. 
#cosign verify-blob --key cosign.pub --signature signature.txt TestAgent.txt
#cosign verify-blob --key cosign.pub --signature addsignature TestAgent.txt
