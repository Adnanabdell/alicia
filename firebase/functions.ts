import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// This file serves as documentation for the required backend logic.
// In a real project, this would be in the 'functions' directory and deployed.

admin.initializeApp();

export const checkSubscriptions = functions.pubsub.schedule('every 24 hours').onRun(async (context) => {
  const db = admin.firestore();
  const today = new Date();
  const threeDaysLater = new Date();
  threeDaysLater.setDate(today.getDate() + 3);

  const studentsSnapshot = await db.collection('students').get();

  const batch = db.batch();

  studentsSnapshot.docs.forEach(doc => {
    const student = doc.data();
    let updated = false;
    const notifications = [];

    if (student.subscriptions) {
      student.subscriptions.forEach((sub: any) => {
        const expiryDate = new Date(sub.validUntil);
        
        // Logic: Check if expiring in exactly 3 days (ignoring hours)
        const diffTime = expiryDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 3) {
           // Create in-app notification logic here
           // For simplicity, we assume there is a subcollection 'notifications' on the student
           const notifRef = doc.ref.collection('notifications').doc();
           batch.set(notifRef, {
             message: `Subscription for subject ${sub.subjectId} expires in 3 days.`,
             date: admin.firestore.FieldValue.serverTimestamp(),
             read: false
           });
        }
      });
    }
  });

  await batch.commit();
  console.log('Subscription check complete');
  return null;
});