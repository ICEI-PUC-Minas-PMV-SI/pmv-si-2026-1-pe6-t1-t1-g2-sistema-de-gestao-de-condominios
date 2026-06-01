import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
import { SafeAreaView } from "react-native-safe-area-context";

import { exchangeSocialCode, loginUser, registerUser } from "@/services/auth";
import { setAuthToken, setAuthUserId } from "@/services/authSession";

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID?.trim() ?? "";

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
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [senhaVisivel, setSenhaVisivel] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  async function handleRegister() {
    const normalizedName = nome.trim();
    const normalizedEmail = email.trim();

    if (!normalizedName || !normalizedEmail || !senha.trim()) {
      setFeedback("Preencha nome, e-mail e senha para criar sua conta.");
      return;
    }

    setIsSubmitting(true);
    setFeedback("");

    try {
      await registerUser({
        username: normalizedName,
        email: normalizedEmail,
        password: senha,
      });

      const authResult = await loginUser({
        email: normalizedEmail,
        password: senha,
      });

      setAuthToken(authResult.token);
      setAuthUserId(authResult.user?.id ?? null);

      router.replace("/(tabs)");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Não foi possível criar a conta.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleSocialSuccess = () => {
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View style={styles.logoRow}>
              <Ionicons name="business-outline" size={24} color={COLORS.primary} />
              <Text style={styles.logoText}>Condominio</Text>
            </View>
            <TouchableOpacity onPress={() => router.replace("/")}>
              <Text style={styles.entrarBtn}>Entrar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Criar sua conta</Text>
            <Text style={styles.cardSubtitle}>Comece sua jornada hoje mesmo.</Text>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Nome Completo</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="person-outline"
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>E-mail</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="mail-outline"
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Senha</Text>
              <View style={styles.inputWrapper}>
                <Ionicons
                  name="lock-closed-outline"
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
                  <Ionicons
                    name={senhaVisivel ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.onSurfaceVariant}
                  />
                </Pressable>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, isSubmitting ? styles.primaryBtnDisabled : null]}
              activeOpacity={0.85}
              onPress={handleRegister}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={COLORS.onPrimary} />
              ) : (
                <>
                  <Text style={styles.primaryBtnText}>Criar conta</Text>
                  <Ionicons name="arrow-forward" size={20} color={COLORS.onPrimary} />
                </>
              )}
            </TouchableOpacity>

            {feedback ? <Text style={styles.feedbackText}>{feedback}</Text> : null}

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OU CADASTRE-SE COM</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialAuthButtons
              onSuccess={handleSocialSuccess}
              onMessage={setFeedback}
            />

            <View style={styles.loginRow}>
              <Text style={styles.loginText}>Já tem uma conta? </Text>
              <TouchableOpacity onPress={() => router.replace("/")}>
                <Text style={styles.loginLink}>Entre aqui</Text>
              </TouchableOpacity>
            </View>
          </View>

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
    </SafeAreaView>
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
  primaryBtnDisabled: {
    opacity: 0.72,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.onPrimary,
    letterSpacing: 0.5,
  },
  feedbackText: {
    marginTop: 12,
    fontSize: 12,
    lineHeight: 18,
    color: "#B42318",
    textAlign: "center",
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

type SocialAuthButtonsProps = {
  onSuccess: () => void;
  onMessage: (message: string) => void;
};

function SocialAuthButtons({ onSuccess, onMessage }: SocialAuthButtonsProps) {
  const [isBusy, setIsBusy] = useState(false);

  const googleConfig = useMemo(() => {
    if (!GOOGLE_CLIENT_ID) {
      return null;
    }

    return {
      clientId: GOOGLE_CLIENT_ID,
      webClientId: GOOGLE_CLIENT_ID,
      iosClientId: GOOGLE_CLIENT_ID,
      androidClientId: GOOGLE_CLIENT_ID,
      responseType: AuthSession.ResponseType.Code,
      shouldAutoExchangeCode: false,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "condominio",
        path: "oauthredirect",
      }),
    };
  }, []);

  const [request, response, promptAsync] = Google.useAuthRequest(
    googleConfig ?? {
      clientId: "placeholder-google-client-id",
      webClientId: "placeholder-google-client-id",
      responseType: AuthSession.ResponseType.Code,
      shouldAutoExchangeCode: false,
      scopes: ["openid", "profile", "email"],
      redirectUri: AuthSession.makeRedirectUri({
        scheme: "condominio",
        path: "oauthredirect",
      }),
    },
  );

  useEffect(() => {
    if (response?.type !== "success") {
      if (response?.type === "dismiss" || response?.type === "cancel") {
        setIsBusy(false);
      }
      return;
    }

    const code = response.params.code;
    if (!code) {
      onMessage("O provedor social não retornou o código de autorização.");
      setIsBusy(false);
      return;
    }

    if (!request?.codeVerifier) {
      onMessage("Não foi possível gerar o verificador de segurança do login social.");
      setIsBusy(false);
      return;
    }

    exchangeSocialCode({
      provider: "google",
      code,
      codeVerifier: request.codeVerifier,
      redirectUri: request.redirectUri,
    })
      .then((result) => {
        setAuthToken(result.token);
        setAuthUserId(result.user?.id ?? null);
        onMessage("");
        onSuccess();
      })
      .catch((error) => {
        onMessage(error instanceof Error ? error.message : "Falha no login social do Google.");
      })
      .finally(() => {
        setIsBusy(false);
      });
  }, [onMessage, onSuccess, request?.codeVerifier, request?.redirectUri, response]);

  async function handleGooglePress() {
    if (!GOOGLE_CLIENT_ID) {
      onMessage("Configure EXPO_PUBLIC_GOOGLE_CLIENT_ID para usar login social do Google.");
      return;
    }

    if (!request) {
      onMessage("Carregando configuração do Google... tente novamente em instantes.");
      return;
    }

    setIsBusy(true);
    onMessage("");

    try {
      await promptAsync();
    } catch (error) {
      setIsBusy(false);
      onMessage(error instanceof Error ? error.message : "Não foi possível iniciar o login do Google.");
    }
  }

  function handleApplePress() {
    onMessage("Login com Apple ainda não está configurado no backend.");
  }

  return (
    <View style={styles.socialRow}>
      <TouchableOpacity
        style={styles.socialBtn}
        activeOpacity={0.8}
        onPress={handleGooglePress}
        disabled={isBusy}
      >
        {isBusy ? (
          <ActivityIndicator size="small" color={COLORS.onSecondaryContainer} />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color={COLORS.onSecondaryContainer} />
            <Text style={styles.socialBtnText}>Google</Text>
          </>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.socialBtn} activeOpacity={0.8} onPress={handleApplePress}>
        <Ionicons name="logo-apple" size={20} color={COLORS.onSecondaryContainer} />
        <Text style={styles.socialBtnText}>Apple</Text>
      </TouchableOpacity>
    </View>
  );
}