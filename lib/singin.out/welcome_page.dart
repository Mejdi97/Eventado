import 'package:flutter/material.dart';
import 'package:pim/singin.out/social_page.dart';

import '../delayedAnimation.dart';
import '../main.dart';

class WelcomePage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Color(0xFFEDECF2),
      body: SingleChildScrollView(
        child: Container(
          margin: EdgeInsets.symmetric(
            vertical: 100,
            horizontal: 30,
          ),
          child: Column(
            children: [
              DelayedAnimation(
                delay: 1500,
                child: Container(
                  margin: EdgeInsets.fromLTRB(10, 20, 10,20),

                  child: Image.asset('assets/images/logo.png',width: 250,height: 250, ),
                ),
              ),

              DelayedAnimation(
                delay: 2500,
                child: Container(
                  margin: EdgeInsets.only(
                    top: 100,
                    bottom: 20,
                  ),
                  child: Text(
                    "Next generation of entertainment.",

                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,)



                  ),
                ),
              ),
              DelayedAnimation(
                delay: 3500,
                child: Container(
                  width: double.infinity,
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                        primary: color,
                        shape: StadiumBorder(),
                        padding: EdgeInsets.all(13)),
                    child: Text('GET STARTED'),
                    onPressed: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => SocialPage(),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}