import 'package:flutter/material.dart';
import 'ecology_screen.dart';
import 'dashboard_screen.dart';

void main() {
  runApp(const ConsumMobileApp());
}

class ConsumMobileApp extends StatelessWidget {
  const ConsumMobileApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Consum Mobile PoC',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.amber),
        useMaterial3: true,
      ),
      home: const HomeScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Consum Flutter PoC')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            ElevatedButton(
              onPressed: () => Navigator.push(
                context, 
                MaterialPageRoute(builder: (context) => const EcologyScreen())
              ),
              child: const Text('Voir Page Écologie'),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.push(
                context, 
                MaterialPageRoute(builder: (context) => const DashboardScreen())
              ),
              child: const Text('Voir Dashboard'),
            ),
          ],
        ),
      ),
    );
  }
}
