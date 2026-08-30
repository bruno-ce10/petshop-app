# PetShop App — projeto extensionista

App mobile em React Native (Expo) para o pet shop parceiro: cadastro de tutor
e pets, agendamento de banho/tosa/consulta e um painel de agenda (dia/semana)
para o lojista.

## Requisitos implementados neste MVP

- RF01/RF02 — entrada do tutor (nome + e-mail, salvo localmente)
- RF04/RF05/RF06 — cadastro, listagem e remoção de pets
- RF07/RF08 — novo agendamento com horários disponíveis calculados em tempo real
- RF09/RF10 — listagem e cancelamento dos agendamentos do tutor
- RF12/RF13 — agenda do lojista por dia e por semana
- RF14 — lojista pode avançar o status do atendimento (pendente → confirmado → concluído)

Os dados (usuário, pets, agendamentos) são salvos localmente no dispositivo
com AsyncStorage — não é necessário backend para rodar e testar o MVP.

## Como rodar

1. Instale as dependências:
   ```
   npm install
   ```
2. Inicie o projeto com o Expo:
   ```
   npx expo start
   ```
3. Escaneie o QR code com o app **Expo Go** (Android/iOS) no seu celular,
   ou pressione `a` para abrir num emulador Android / `i` para simulador iOS.

## Estrutura

```
App.js
src/
  context/AppContext.js      # estado global + persistência local
  navigation/AppNavigator.js # stack + tabs
  screens/                   # telas do app
  theme/colors.js            # paleta de cores
```

## Próximos passos sugeridos

- Autenticação real (ex: Firebase Auth) em vez de login local.
- Backend/API para os dados serem compartilhados entre tutor e lojista em
  tempo real (hoje cada instalação do app tem seus próprios dados locais).
- Notificações push (RF11).
- Edição de dados do tutor (RF03) e edição de pet (RF06 — hoje só remove).
