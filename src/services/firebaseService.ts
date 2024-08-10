import { FirebaseApp, initializeApp } from 'firebase/app';

export class FirebaseService {
    private firebaseApp: FirebaseApp;

    private firebaseAppConfig = {
        apiKey: "AIzaSyCe-gLA62Z68YVh_8jx-wCXuXksT-ZD3ws",
        authDomain: "matektabor.miklosdanka.com",
        databaseURL: "https://barkochba-app.firebaseio.com",
        projectId: "barkochba-app",
        storageBucket: "barkochba-app.appspot.com",
        messagingSenderId: "134084998344",
    };

    public constructor() {
        this.firebaseApp = initializeApp(this.firebaseAppConfig);
    }

    public getApp = () => {
        return this.firebaseApp;
    };
}
