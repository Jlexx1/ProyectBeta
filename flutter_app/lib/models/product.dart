class Product {
  final int id;
  final int userId;
  final String name;
  final String description;
  final double price;
  final int stock;
  final String category;
  final String createdAt;

  Product({
    required this.id,
    required this.userId,
    required this.name,
    required this.description,
    required this.price,
    required this.stock,
    required this.category,
    required this.createdAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'] ?? 0,
      userId: json['user_id'] ?? 0,
      name: json['name'] ?? '',
      description: json['description'] ?? '',
      price: (json['price'] ?? 0).toDouble(),
      stock: json['stock'] ?? 0,
      category: json['category'] ?? '',
      createdAt: json['created_at'] ?? '',
    );
  }
}
