import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart'; // Equivalent of Recharts
import 'package:lucide_icons/lucide_icons.dart'; // Equivalent of Lucide React

// ==========================================
// MOCK DATA (Simulates API)
// ==========================================
class EcoStat {
  final String label;
  final String value;
  final String unit;
  final IconData icon;
  final Color color;

  EcoStat(this.label, this.value, this.unit, this.icon, this.color);
}

class BadgeData {
  final String name;
  final String description;
  final IconData icon;
  final String rarity;
  final double progress;
  final bool earned;

  BadgeData({required this.name, required this.description, required this.icon, required this.rarity, required this.progress, required this.earned});
}

// ==========================================
// SCREEN WIDGET
// ==========================================
class EcologyScreen extends StatefulWidget {
  const EcologyScreen({super.key});

  @override
  State<EcologyScreen> createState() => _EcologyScreenState();
}

class _EcologyScreenState extends State<EcologyScreen> {
  bool isDarkMode = false; // Theme state
  String selectedPeriod = 'month'; // 'month', 'year', 'all'

  // Simulating fetched data
  final List<EcoStat> stats = [
    EcoStat('CO2 Total', '142.5', 'kg', LucideIcons.leaf, Colors.green),
    EcoStat('Arbres équiv.', '6', 'arbres', LucideIcons.trees, Colors.teal),
    EcoStat('Distance', '1,240', 'km', LucideIcons.footprints, Colors.blue),
    EcoStat('Score Éco', '85', '/100', LucideIcons.trendingUp, Colors.amber),
  ];

  final List<BadgeData> badges = [
    BadgeData(name: "Premier Trajet", description: "Effectuer 1 trajet", icon: LucideIcons.car, rarity: "common", progress: 100, earned: true),
    BadgeData(name: "Explorateur", description: "Parcourir 100 km", icon: LucideIcons.target, rarity: "common", progress: 100, earned: true),
    BadgeData(name: "Économe", description: "Économiser 10L", icon: LucideIcons.zap, rarity: "rare", progress: 45, earned: false),
    BadgeData(name: "Gardien", description: "Économiser 50kg CO2", icon: LucideIcons.shield, rarity: "rare", progress: 20, earned: false),
    BadgeData(name: "Marathonien", description: "1000 km", icon: LucideIcons.rocket, rarity: "epic", progress: 10, earned: false),
  ];

  @override
  Widget build(BuildContext context) {
    // Theme colors
    final bgColor = isDarkMode ? Colors.black : Colors.grey[50];
    final textColor = isDarkMode ? Colors.white : Colors.grey[900];
    final cardColor = isDarkMode ? Colors.green[900]!.withOpacity(0.1) : Colors.white;
    final borderColor = isDarkMode ? Colors.green[900]!.withOpacity(0.3) : Colors.green[200];

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        title: Row(
          children: [
            const Icon(LucideIcons.leaf, color: Colors.green, size: 28),
            const SizedBox(width: 12),
            Text('Écologie', style: TextStyle(color: textColor, fontWeight: FontWeight.bold)),
          ],
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          // Theme Toggle Simulator
          IconButton(
            icon: Icon(isDarkMode ? Icons.light_mode : Icons.dark_mode, color: textColor),
            onPressed: () => setState(() => isDarkMode = !isDarkMode),
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            // 1. Period Selectors
            Row(
              children: ['month', 'year', 'all'].map((period) {
                final isSelected = selectedPeriod == period;
                return Padding(
                  padding: const EdgeInsets.only(right: 8.0),
                  child: ChoiceChip(
                    label: Text(period == 'month' ? 'Mois' : period == 'year' ? 'Année' : 'Total'),
                    selected: isSelected,
                    onSelected: (bool selected) {
                      setState(() {
                        selectedPeriod = period;
                      });
                    },
                    selectedColor: Colors.green[600],
                    labelStyle: TextStyle(color: isSelected ? Colors.white : textColor),
                    backgroundColor: Colors.transparent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                      side: BorderSide(color: isSelected ? Colors.transparent : borderColor!),
                    ),
                  ),
                );
              }).toList(),
            ),
            const SizedBox(height: 24),

            // 2. Stats Grid
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2, // Mobile friendly (2 columns)
                childAspectRatio: 1.5,
                crossAxisSpacing: 16,
                mainAxisSpacing: 16,
              ),
              itemCount: stats.length,
              itemBuilder: (context, index) {
                final stat = stats[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: borderColor!),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(stat.icon, color: stat.color, size: 28),
                      const Spacer(),
                      RichText(
                        text: TextSpan(
                          children: [
                            TextSpan(text: stat.value, style: TextStyle(color: textColor, fontSize: 24, fontWeight: FontWeight.bold)),
                            TextSpan(text: ' ${stat.unit}', style: TextStyle(color: textColor.withOpacity(0.6), fontSize: 12)),
                          ],
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(stat.label, style: TextStyle(color: textColor.withOpacity(0.6), fontSize: 14)),
                    ],
                  ),
                );
              },
            ),
            const SizedBox(height: 24),

            // 3. Charts Section
            Container(
              height: 300,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: borderColor!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Consommation mensuelle", style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 20),
                  Expanded(
                    child: LineChart(
                      LineChartData(
                        gridData: const FlGridData(show: false),
                        titlesData: const FlTitlesData(show: false), // Simplified for PoC
                        borderData: FlBorderData(show: false),
                        lineBarsData: [
                          LineChartBarData(
                            spots: [
                              const FlSpot(0, 3), const FlSpot(1, 1), const FlSpot(2, 4), const FlSpot(3, 2),
                              const FlSpot(4, 5), const FlSpot(5, 3), const FlSpot(6, 4),
                            ],
                            isCurved: true,
                            color: Colors.green,
                            barWidth: 3,
                            dotData: const FlDotData(show: false),
                            belowBarData: BarAreaData(show: true, color: Colors.green.withOpacity(0.1)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4. Badges Section
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: borderColor!),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      const Icon(LucideIcons.award, color: Colors.green),
                      const SizedBox(width: 8),
                      Text("Badges Écologiques", style: TextStyle(color: textColor, fontSize: 18, fontWeight: FontWeight.bold)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Wrap(
                    spacing: 12,
                    runSpacing: 12,
                    children: badges.map((badge) {
                      return Opacity(
                        opacity: badge.earned ? 1.0 : 0.5,
                        child: Container(
                          width: 100,
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: badge.earned ? _getRarityColor(badge.rarity).withOpacity(0.2) : Colors.grey.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                                color: badge.earned ? _getRarityColor(badge.rarity) : Colors.grey,
                                width: badge.earned ? 2 : 1
                            ),
                          ),
                          child: Column(
                            children: [
                              Icon(badge.icon, size: 32, color: badge.earned ? _getRarityColor(badge.rarity) : Colors.grey),
                              const SizedBox(height: 8),
                              Text(
                                badge.name,
                                style: TextStyle(color: textColor, fontSize: 11, fontWeight: FontWeight.bold),
                                textAlign: TextAlign.center
                              ),
                              if (!badge.earned) ...[
                                const SizedBox(height: 4),
                                LinearProgressIndicator(
                                  value: badge.progress / 100,
                                  backgroundColor: Colors.grey[300],
                                  color: Colors.green,
                                  minHeight: 4,
                                ),
                              ]
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Color _getRarityColor(String rarity) {
    switch (rarity) {
      case 'common': return Colors.grey;
      case 'rare': return Colors.blue;
      case 'epic': return Colors.purple;
      case 'legendary': return Colors.amber;
      default: return Colors.green;
    }
  }
}
