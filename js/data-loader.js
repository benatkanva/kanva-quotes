// Kanva Data Loader Utility
// Loads JSON data files for products, tiers, shipping, payment, and admin emails

const DataLoader = {
  // Loads a JSON file from the data/ directory
  load: async function(filename) {
    const response = await fetch(`data/${filename}`);
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.statusText}`);
    }
    return await response.json();
  },

  // Loads all config data in parallel
  loadAll: async function() {
    const [products, tiers, shipping, payment, adminEmails] = await Promise.all([
      this.load('products.json'),
      this.load('tiers.json'),
      this.load('shipping.json'),
      this.load('payment.json'),
      this.load('admin-emails.json')
    ]);
    return { products, tiers, shipping, payment, adminEmails };
  }
};

// Example usage (uncomment for testing):
// DataLoader.loadAll().then(data => console.log(data));

export { DataLoader };
