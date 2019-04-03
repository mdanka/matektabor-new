import * as firebase from "firebase/app";
import "firebase/auth";

export class FirebaseService {
    private firebaseApp: firebase.app.App;

    private firebaseAppConfig = {
        apiKey: "AIzaSyCe-gLA62Z68YVh_8jx-wCXuXksT-ZD3ws",
        authDomain: "matektabor.miklosdanka.com",
        databaseURL: "https://barkochba-app.firebaseio.com",
        projectId: "barkochba-app",
        storageBucket: "barkochba-app.appspot.com",
        messagingSenderId: "134084998344",
    };

    public constructor() {
        this.firebaseApp = firebase.initializeApp(this.firebaseAppConfig);
    }

    public getApp = () => {
        return this.firebaseApp;
    };
}
