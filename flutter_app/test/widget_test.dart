import 'package:flutter_test/flutter_test.dart';
import 'package:aldia_app/main.dart';

void main() {
  testWidgets('ALDIA app renders login screen', (WidgetTester tester) async {
    await tester.pumpWidget(const AldiaApp());
    expect(find.text('ALDIA'), findsOneWidget);
    expect(find.text('Iniciar sesion'), findsOneWidget);
  });
}
