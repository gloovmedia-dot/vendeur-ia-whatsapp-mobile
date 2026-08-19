import { useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Button,
  Card,
  H1,
  H3,
  Input,
  Paragraph,
  ScrollView,
  SizableText,
  XStack,
  YStack,
} from '@blinkdotnew/mobile-ui';
import { Image } from 'expo-image';

const GREEN = '#117A65';
const ORANGE = '#E97832';
const INK = '#17342E';
const MUTED = '#6D817B';
const SOFT = '#F2F7F5';

type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
};

type Cart = Record<string, number>;

const PRODUCTS: Product[] = [
  { id: 'robe', name: 'Robe élégante', category: 'Mode', price: 25000, stock: 8, image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=600' },
  { id: 'chemise', name: 'Chemise homme', category: 'Mode', price: 15000, stock: 12, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600' },
  { id: 'sac', name: 'Sac à main', category: 'Accessoires', price: 18000, stock: 5, image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600' },
  { id: 'chaussures', name: 'Chaussures femme', category: 'Mode', price: 30000, stock: 3, image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600' },
  { id: 'parfum', name: 'Parfum', category: 'Beauté', price: 12000, stock: 20, image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600' },
];

const formatPrice = (value: number) => `${value.toLocaleString('fr-FR')} FCFA`;

function ProductCard({ product, quantity, onAdd }: { product: Product; quantity: number; onAdd: () => void }) {
  return (
    <Card bordered backgroundColor="#FFFFFF" borderColor="#E1ECE8" borderRadius="$5" overflow="hidden" width={170}>
      <Image source={product.image} style={{ width: '100%', height: 132 }} contentFit="cover" />
      <YStack padding="$3" gap="$2">
        <SizableText size="$3" color={INK} fontWeight="700" numberOfLines={1}>{product.name}</SizableText>
        <SizableText size="$2" color={MUTED}>{product.category} · {product.stock} disponibles</SizableText>
        <XStack alignItems="center" justifyContent="space-between" gap="$2">
          <SizableText size="$3" color={GREEN} fontWeight="800">{formatPrice(product.price)}</SizableText>
          <Button size="$3" circular theme="active" backgroundColor={GREEN} color="white" onPress={onAdd} accessibilityLabel={`Ajouter ${product.name}`}>
            {quantity > 0 ? `+${quantity}` : '+'}
          </Button>
        </XStack>
      </YStack>
    </Card>
  );
}

export default function Home() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tous');
  const [cart, setCart] = useState<Cart>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notice, setNotice] = useState('');

  const categories = ['Tous', ...Array.from(new Set(PRODUCTS.map((product) => product.category)))];
  const filteredProducts = useMemo(() => PRODUCTS.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'Tous' || product.category === category;
    return matchesSearch && matchesCategory;
  }), [category, search]);
  const cartItems = PRODUCTS.filter((product) => cart[product.id]);
  const totalItems = cartItems.reduce((sum, product) => sum + cart[product.id], 0);
  const total = cartItems.reduce((sum, product) => sum + product.price * cart[product.id], 0);

  const addToCart = (product: Product) => {
    if ((cart[product.id] || 0) >= product.stock) return;
    setCart((current) => ({ ...current, [product.id]: (current[product.id] || 0) + 1 }));
    if (Platform.OS !== 'web') Haptics.selectionAsync();
    setNotice(`${product.name} ajouté au panier`);
  };

  const createWhatsAppOrder = async () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setNotice('Ajoutez votre nom et votre numéro WhatsApp pour continuer.');
      return;
    }
    const lines = cartItems.map((product) => `• ${product.name} x${cart[product.id]} — ${formatPrice(product.price * cart[product.id])}`).join('\n');
    const message = `Bonjour Boutique Étoile Brazzaville, je souhaite passer commande :\n\n${lines}\n\nTotal : ${formatPrice(total)}\nClient : ${customerName}\nTéléphone : ${customerPhone}\n\nMerci de confirmer ma commande.`;
    const url = `https://wa.me/242060000000?text=${encodeURIComponent(message)}`;
    try {
      await Linking.openURL(url);
      setNotice('Votre commande est prête dans WhatsApp. Vérifiez le message avant de l’envoyer.');
    } catch {
      setNotice('WhatsApp ne peut pas être ouvert sur cet appareil. Copiez votre récapitulatif et contactez la boutique.');
    }
  };

  return (
    <YStack flex={1} backgroundColor={SOFT}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 42 }}>
        <YStack maxWidth={900} width="100%" alignSelf="center" gap="$4">
          <XStack justifyContent="space-between" alignItems="flex-start">
            <YStack gap="$1" flex={1}>
              <SizableText size="$3" color={GREEN} fontWeight="800">BOUTIQUE ÉTOILE · BRAZZAVILLE</SizableText>
              <H1 color={INK} fontSize={32} lineHeight={38}>Commandez directement sur WhatsApp</H1>
              <Paragraph color={MUTED}>Choisissez vos articles, puis envoyez votre récapitulatif à notre équipe.</Paragraph>
            </YStack>
            <YStack backgroundColor="#DDEFE8" borderRadius="$4" paddingHorizontal="$3" paddingVertical="$2">
              <SizableText size="$2" color={GREEN} fontWeight="800">MODE DÉMO</SizableText>
            </YStack>
          </XStack>

          <Card backgroundColor="#D9EEE7" borderRadius="$6" padding="$4" bordered borderColor="#B9DDD0">
            <XStack justifyContent="space-between" alignItems="center" gap="$3">
              <YStack flex={1} gap="$1">
                <H3 color={INK}>Un catalogue simple, une commande claire</H3>
                <SizableText color="#42665C">Les stocks et les prix affichés sont ceux de la boutique.</SizableText>
              </YStack>
              <SizableText fontSize={38}>🛍️</SizableText>
            </XStack>
          </Card>

          <Input value={search} onChangeText={setSearch} placeholder="Rechercher un produit" backgroundColor="#FFFFFF" />
          <XStack gap="$2" flexWrap="wrap">
            {categories.map((item) => (
              <Button key={item} size="$3" chromeless={category !== item} backgroundColor={category === item ? GREEN : '#FFFFFF'} color={category === item ? 'white' : INK} borderColor="#DCE8E4" borderWidth={1} borderRadius="$4" onPress={() => setCategory(item)}>
                {item}
              </Button>
            ))}
          </XStack>

          <XStack flexWrap="wrap" gap="$3" justifyContent="center">
            {filteredProducts.map((product) => <ProductCard key={product.id} product={product} quantity={cart[product.id] || 0} onAdd={() => addToCart(product)} />)}
          </XStack>

          {cartItems.length > 0 && (
            <Card backgroundColor="#FFFFFF" borderRadius="$6" bordered borderColor="#DDE9E5" padding="$4" gap="$3">
              <XStack justifyContent="space-between" alignItems="center">
                <YStack>
                  <SizableText size="$5" color={INK} fontWeight="800">Votre commande</SizableText>
                  <SizableText color={MUTED}>{totalItems} article{totalItems > 1 ? 's' : ''}</SizableText>
                </YStack>
                <SizableText size="$5" color={ORANGE} fontWeight="800">{formatPrice(total)}</SizableText>
              </XStack>
              {cartItems.map((product) => (
                <XStack key={product.id} justifyContent="space-between" alignItems="center">
                  <SizableText color={INK}>{product.name} × {cart[product.id]}</SizableText>
                  <XStack alignItems="center" gap="$2">
                    <Button size="$2" circular chromeless onPress={() => setCart((current) => ({ ...current, [product.id]: Math.max(0, current[product.id] - 1) }))}>−</Button>
                    <SizableText color={INK}>{cart[product.id]}</SizableText>
                    <Button size="$2" circular chromeless onPress={() => addToCart(product)}>+</Button>
                  </XStack>
                </XStack>
              ))}
              <Input value={customerName} onChangeText={setCustomerName} placeholder="Votre nom complet" backgroundColor="#F6FAF8" />
              <Input value={customerPhone} onChangeText={setCustomerPhone} placeholder="Votre numéro WhatsApp" keyboardType="phone-pad" backgroundColor="#F6FAF8" />
              <Button height={50} backgroundColor={ORANGE} color="white" borderRadius="$4" onPress={createWhatsAppOrder}>Continuer dans WhatsApp</Button>
              <SizableText size="$2" color={MUTED} textAlign="center">Le message sera préparé, vous gardez le contrôle avant l’envoi.</SizableText>
            </Card>
          )}

          {notice ? <Card backgroundColor="#FFF3E9" borderColor="#F6C59F" bordered borderRadius="$4" padding="$3"><SizableText color="#9A4C16">{notice}</SizableText></Card> : null}
        </YStack>
      </ScrollView>
    </YStack>
  );
}
