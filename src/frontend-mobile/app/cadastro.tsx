import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const COLORS = {
  primary: "#40557b",
  onPrimary: "#ffffff",
  surface: "#f9f9ff",
  onSurface: "#111c2d",
  onSurfaceVariant: "#44474e",
  surfaceContainerLowest: "#ffffff",
  surfaceContainer: "#e7eeff",
  outlineVariant: "#c4c6cf",
  secondaryContainer: "#dce0e5",
  onSecondaryContainer: "#5e6367",
  inputBg: "#E9EDF2",
  secondary: "#5a5f63",
};

export default function CadastroScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <MaterialIcons name="apartment" size={24} color={COLORS.primary} />
            <Text style={styles.logoText}>Condominio</Text>
          </View>
          <TouchableOpacity onPress={() => router.replace("/")}>
            <Text style={styles.entrarBtn}>Entrar</Text>
          </TouchableOpacity>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Criar sua conta</Text>
          <Text style={styles.cardSubtitle}>Comece sua jornada hoje mesmo.</Text>

          {/* Nome */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Nome Completo</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="person"
                size={20}
                color={COLORS.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={COLORS.onSurfaceVariant + "80"}
                value={nome}
                onChangeText={setNome}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="mail"
                size={20}
                color={COLORS.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="email@exemplo.com"
                placeholderTextColor={COLORS.onSurfaceVariant + "80"}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Senha */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Senha</Text>
            <View style={styles.inputWrapper}>
              <MaterialIcons
                name="lock"
                size={20}
                color={COLORS.onSurfaceVariant}
                style={styles.inputIcon}
              />
              <TextInput
                style={[styles.input, styles.inputWithTrailing]}
                placeholder="••••••••"
                placeholderTextColor={COLORS.onSurfaceVariant + "80"}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry={!senhaVisivel}
                autoCapitalize="none"
              />
              <Pressable
                onPress={() => setSenhaVisivel((v) => !v)}
                style={styles.visibilityBtn}
              >
                <MaterialIcons
                  name={senhaVisivel ? "visibility-off" : "visibility"}
                  size={20}
                  color={COLORS.onSurfaceVariant}
                />
              </Pressable>
            </View>
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={() => {}}
          >
            <Text style={styles.primaryBtnText}>Criar conta</Text>
            <MaterialIcons name="arrow-forward" size={20} color={COLORS.onPrimary} />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OU CADASTRE-SE COM</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Social buttons */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <Image
                source={{
                  uri: "https://developers.google.com/static/identity/images/g-logo.png",
                }}
                style={styles.googleIcon}
              />
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8}>
              <MaterialIcons name="apple" size={20} color={COLORS.onSecondaryContainer} />
              <Text style={styles.socialBtnText}>Apple</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.loginLink}>Entre aqui</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerCopy}>© 2024 CONDOMINIO.</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>TERMOS</Text>
            <Text style={styles.footerLink}>PRIVACIDADE</Text>
            <Text style={styles.footerLink}>AJUDA</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    letterSpacing: -0.5,
  },
  entrarBtn: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
    letterSpacing: 0.5,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.primary,
    paddingBottom: 1,
  },
  card: {
    width: "100%",
    backgroundColor: COLORS.surfaceContainerLowest,
    borderRadius: 40,
    padding: 32,
    borderWidth: 1,
    borderColor: COLORS.surfaceContainer,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.05,
    shadowRadius: 50,
    elevation: 4,
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.onSurface,
    textAlign: "center",
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 16,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: 28,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBg,
    borderRadius: 12,
    height: 48,
  },
  inputIcon: {
    marginLeft: 14,
    opacity: 0.6,
  },
  input: {
    flex: 1,
    height: "100%",
    paddingHorizontal: 12,
    fontSize: 16,
    color: COLORS.onSurface,
  },
  inputWithTrailing: {
    paddingRight: 0,
  },
  visibilityBtn: {
    paddingHorizontal: 14,
    height: "100%",
    justifyContent: "center",
    opacity: 0.6,
  },
  primaryBtn: {
    height: 56,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onPrimary,
    letterSpacing: 0.5,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.outlineVariant,
    opacity: 0.3,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.onSurfaceVariant,
    letterSpacing: 1.5,
  },
  socialRow: {
    flexDirection: "row",
    gap: 16,
  },
  socialBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.secondaryContainer + "80",
    borderWidth: 1,
    borderColor: COLORS.outlineVariant + "33",
  },
  googleIcon: {
    width: 20,
    height: 20,
  },
  socialBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onSecondaryContainer,
  },
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },
  loginText: {
    fontSize: 12,
    color: COLORS.onSurfaceVariant,
  },
  loginLink: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.primary,
    textDecorationLine: "underline",
  },
  footer: {
    alignItems: "center",
    gap: 16,
    width: "100%",
  },
  footerCopy: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.secondary,
    textAlign: "center",
    letterSpacing: 1.5,
  },
  footerLinks: {
    flexDirection: "row",
    gap: 24,
  },
  footerLink: {
    fontSize: 12,
    fontWeight: "500",
    color: COLORS.onSecondaryContainer,
    textDecorationLine: "underline",
    letterSpacing: 1,
  },
});
