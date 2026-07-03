import 'package:flutter_test/flutter_test.dart';

import 'package:aldia_app/main.dart';

void main() {
  testWidgets('App renders landing screen', (WidgetTester tester) async {
    await tester.pumpWidget(const AldiaApp());
    expect(find.text('Empezar gratis — 14 días'), findsOneWidget);
  });
}
