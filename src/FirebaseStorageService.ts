import firebase from './FirebaseConfig';

const storageRef = firebase.storage().ref();

const uploadFile = async (file: File, fullFilePath: string, progressCallback: React.Dispatch<React.SetStateAction<number>>) => {
  const uploadTask = storageRef.child(fullFilePath).put(file);

  uploadTask.on(
    "state_changed",
    (snapshot) => {
      const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);

      progressCallback(progress);
    },
    (error) => {
      throw error;
    }
  );

  return uploadTask.then(async () => {
    const downloadUrl = await uploadTask.snapshot.ref.getDownloadURL();

    return downloadUrl;
  });
};

const deleteFile = (fileDownloadUrl: string) => {
  const decodeUrl = decodeURIComponent(fileDownloadUrl);
  const startIndex = decodeUrl.indexOf('/o/') + 3;
  const endIndex = decodeUrl.indexOf('?');
  const filePath = decodeUrl.substring(startIndex, endIndex);

  return storageRef.child(filePath).delete();
};

const FirebaseStorageService = {
  uploadFile,
  deleteFile,
};

export default FirebaseStorageService;