class User {
  final int id;
  final String nombreNegocio;
  final String email;
  final String role;

  User({
    required this.id,
    required this.nombreNegocio,
    required this.email,
    required this.role,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      nombreNegocio: json['nombre_negocio'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'user',
    );
  }
}
