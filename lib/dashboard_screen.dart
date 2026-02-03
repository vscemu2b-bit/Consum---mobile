import 'package:flutter/material.dart';
import 'dart:ui'; // For ImageFilter
import 'package:lucide_icons/lucide_icons.dart';

// ==========================================
// MOCK MAP WIDGET (Placeholder for MapboxGL)
// ==========================================
class MapboxMapWidget extends StatelessWidget {
  const MapboxMapWidget({super.key});

  @override
  Widget build(BuildContext context) {
    // In a real app, this would be the native MapboxGL view
    return Container(
      color: const Color(0xFF212121), // Dark map background
      child: Stack(
        children: [
          // Simulate map grid/roads
          CustomPaint(painter: MapGridPainter()),
          // Simulate route line (Neon style)
          Center(
            child: Container(
              width: 5,
              height: 300,
              decoration: BoxDecoration(
                color: Colors.amber,
                borderRadius: BorderRadius.circular(2.5),
                boxShadow: const [
                  BoxShadow(color: Colors.amber, blurRadius: 10, spreadRadius: 2)
                ]
              ),
            ),
          ),
          // Simulate User Location Puck
          const Center(
            child: Icon(Icons.navigation, color: Colors.blue, size: 32),
          )
        ],
      ),
    );
  }
}

class MapGridPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.05)
      ..strokeWidth = 1;
    
    // Draw grid
    for (double i = 0; i < size.width; i += 50) {
      canvas.drawLine(Offset(i, 0), Offset(i, size.height), paint);
    }
    for (double i = 0; i < size.height; i += 50) {
      canvas.drawLine(Offset(0, i), Offset(size.width, i), paint);
    }
  }
  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

// ==========================================
// DASHBOARD SCREEN
// ==========================================
class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  // Navigation State
  bool isNavigating = false;
  double distanceToManeuver = 1500; // meters

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // 1. MAP LAYER (Z-index 0)
          const Positioned.fill(child: MapboxMapWidget()),

          // 2. TOP UI LAYER (Search & Profile)
          Positioned(
            top: 60, // Safe Area
            left: 16,
            right: 16,
            child: Row(
              children: [
                // Profile Avatar
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    color: Colors.grey[800],
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white24)
                  ),
                  child: const Icon(LucideIcons.user, color: Colors.white),
                ),
                const SizedBox(width: 12),
                
                // Search Bar (Glassmorphism)
                Expanded(
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(30),
                    child: BackdropFilter(
                      filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                      child: Container(
                        height: 48,
                        padding: const EdgeInsets.symmetric(horizontal: 16),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.1),
                          border: Border.all(color: Colors.white.withOpacity(0.2)),
                        ),
                        child: Row(
                          children: [
                            Icon(LucideIcons.search, color: Colors.white.withOpacity(0.6)),
                            const SizedBox(width: 8),
                            Text(
                              "Où allons-nous ?",
                              style: TextStyle(color: Colors.white.withOpacity(0.6), fontSize: 16),
                            ),
                            const Spacer(),
                            Icon(LucideIcons.mic, color: Colors.white.withOpacity(0.6)),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // 3. STATS ICONS (Top Right)
          Positioned(
            top: 120,
            right: 16,
            child: Column(
              children: [
                _buildGlassIcon(LucideIcons.zap, Colors.amber),
                const SizedBox(height: 12),
                _buildGlassIcon(LucideIcons.layerGroup, Colors.white),
              ],
            ),
          ),

          // 4. NAVIGATION PANEL (Dynamic - Waze Style)
          if (isNavigating)
             Positioned(
               top: 180,
               left: 16,
               right: 16,
               child: _buildDynamicNavPanel()
             ),

          // 5. BOTTOM SHEET (Draggable)
          DraggableScrollableSheet(
            initialChildSize: 0.15,
            minChildSize: 0.15,
            maxChildSize: 0.8,
            builder: (context, scrollController) {
              return ClipRRect(
                borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 15, sigmaY: 15),
                  child: Container(
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.8),
                      border: const Border(top: BorderSide(color: Colors.white10)),
                    ),
                    child: ListView(
                      controller: scrollController,
                      padding: const EdgeInsets.all(20),
                      children: [
                        // Drag Handle
                        Center(
                          child: Container(
                            width: 40, 
                            height: 4, 
                            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2))
                          )
                        ),
                        const SizedBox(height: 20),
                        
                        // Action Buttons Grid
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                             _buildActionButton(LucideIcons.home, "Maison"),
                             _buildActionButton(LucideIcons.briefcase, "Travail"),
                             _buildActionButton(LucideIcons.fuel, "Essence"),
                             _buildActionButton(LucideIcons.parkingCircle, "Parking"),
                          ],
                        ),
                        
                        const SizedBox(height: 30),
                        
                        // Recent Trips List
                        const Text("Récents", style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        _buildRecentTripItem("Paris Centre", "12 km • 25 min"),
                        _buildRecentTripItem("La Défense", "8 km • 18 min"),
                        _buildRecentTripItem("Aéroport CDG", "35 km • 45 min"),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
          
          // 6. TOGGLE NAV SIMULATOR (Debug)
          Positioned(
            bottom: 200,
            right: 16,
            child: FloatingActionButton(
              backgroundColor: Colors.amber,
              child: Icon(isNavigating ? Icons.stop : Icons.play_arrow),
              onPressed: () => setState(() => isNavigating = !isNavigating),
            )
          )
        ],
      ),
      floatingActionButton: Padding(
        padding: const EdgeInsets.only(bottom: 120), // Above Bottom Sheet
        child: FloatingActionButton(
          backgroundColor: Colors.white,
          child: const Icon(LucideIcons.locate, color: Colors.black),
          onPressed: () {},
        ),
      ),
    );
  }

  // Helper Widgets
  Widget _buildGlassIcon(IconData icon, Color color) {
    return ClipOval(
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Container(
          width: 44,
          height: 44,
          color: Colors.black.withOpacity(0.4),
          child: Icon(icon, color: color, size: 20),
        ),
      ),
    );
  }

  Widget _buildActionButton(IconData icon, String label) {
    return Column(
      children: [
        Container(
          width: 56,
          height: 56,
          decoration: BoxDecoration(
            color: Colors.grey[800],
            borderRadius: BorderRadius.circular(16),
          ),
          child: Icon(icon, color: Colors.white),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white, fontSize: 12))
      ],
    );
  }

  Widget _buildRecentTripItem(String title, String subtitle) {
    return ListTile(
      leading: const Icon(LucideIcons.history, color: Colors.grey),
      title: Text(title, style: const TextStyle(color: Colors.white)),
      subtitle: Text(subtitle, style: const TextStyle(color: Colors.grey)),
        contentPadding: EdgeInsets.zero,
    );
  }

  Widget _buildDynamicNavPanel() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(colors: [Colors.green[800]!, Colors.green[900]!]),
        borderRadius: BorderRadius.circular(20),
        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.5), blurRadius: 20)],
        border: Border.all(color: Colors.greenAccent.withOpacity(0.3))
      ),
      child: Row(
        children: [
          const Icon(LucideIcons.cornerUpRight, color: Colors.white, size: 48),
          const SizedBox(width: 16),
          Expanded(
             child: Column(
               crossAxisAlignment: CrossAxisAlignment.start,
               children: const [
                 Text("1.5 km", style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                 SizedBox(height: 4),
                 Text("Quai de la Rapée", style: TextStyle(color: Colors.white70, fontSize: 16)),
               ],
             )
          )
        ],
      ),
    );
  }
}
