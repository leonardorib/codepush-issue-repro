import React from 'react';

import {observer} from 'mobx-react';
import {t} from 'mobx-state-tree';

import {
  Alert,
  Button,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import codePush from 'react-native-code-push';

const Store = t
  .model('Store', {
    someProp: t.optional(t.string, 'Hello World'),
  })
  .actions(self => ({
    setSomeProp(value: string) {
      self.someProp = value;
    },
  }))
  .actions(self => ({
    /**
     * This is the base demonstration of the issue
     * If the some error is thrown in the `try` block, leading to
     * `catch` being reached and we return anything from `catch` (in this case `null`)
     * then we lose the reference to `self` in the `finally` block
     * This only happens in CodePush bundles
     */
    demonstrateIssueExecutingAction: (): void | null => {
      try {
        self.setSomeProp('demonstrateIssue try block');

        throw new Error('demonstrateIssue error');
      } catch (error) {
        return null;
      } finally {
        try {
          // This line will error out in CodePush bundles with `TypeError: undefined is not a function`
          self.setSomeProp('demonstrateIssue finally block');
        } catch (error: any) {
          console.error(error);
          Alert.alert('demonstrateIssue error', error.message ?? error);
        }
      }
    },

    /**
     * A variation of the issue demonstrated in the previous function
     */
    demonstrateIssueInDirectMutation: (): void | null => {
      try {
        self.setSomeProp('demonstrateIssueInDirectMutation try block');

        throw new Error('Error');
      } catch (error) {
        return null;
      } finally {
        try {
          // This will not error out. But the property value will not get updated as it should
          // And again, only happens in CodePush bundles.
          self.someProp = 'demonstrateIssueInDirectMutation finally block';
        } catch (error: any) {
          console.error(error);
          Alert.alert(
            'demonstrateIssueInDirectMutation error',
            error.message ?? error,
          );
        }
      }
    },

    /**
     * This is a workaround for the issue
     * We store a reference to `self` in a variable and use that in the `finally` block
     */
    demonstrateWorkaround: (): void | null => {
      const selfRef = self;
      try {
        self.setSomeProp('demonstrateWorkaround try block');

        throw new Error('demonstrateWorkaround error');
      } catch (error) {
        return null;
      } finally {
        try {
          // This will work properly even in CodePush bundles
          selfRef.setSomeProp('demonstrateWorkaround finally block');
        } catch (error: any) {
          console.error(error);
          Alert.alert('demonstrateWorkaround error', error.message ?? error);
        }
      }
    },
  }));

const store = Store.create({});

const IssueDemo = observer(() => {
  return (
    <SafeAreaView style={styles.backgroundStyle}>
      <StatusBar barStyle={'dark-content'} backgroundColor={'white'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.backgroundStyle}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <View style={styles.section}>
          <Text style={styles.titleText}>Issue Demo</Text>
          <Text style={styles.regularText}>State: {store.someProp}</Text>
          <Button
            title="Demonstrate Issue (Executing action)"
            onPress={store.demonstrateIssueExecutingAction}
          />

          <Button
            title="Demonstrate Issue (Direct mutation)"
            onPress={() => {
              store.demonstrateIssueInDirectMutation();

              // In this case, the code in the finally block doesn't error out
              // but the property is not set to the expected value.
              // So we check here to determine if the update was successful
              const expectedValue =
                'demonstrateIssueInDirectMutation finally block';
              if (store.someProp !== expectedValue) {
                Alert.alert(
                  'Error',
                  `Property was not set to the expected value: ${expectedValue}`,
                );
              }
            }}
          />

          <Button
            title="Demonstrate Workaround"
            onPress={store.demonstrateWorkaround}
          />

          <Button
            title="Reset"
            onPress={() => {
              store.setSomeProp('Hello World');
            }}
          />
        </View>

        <View style={styles.spacer} />

        <View style={styles.section}>
          <Text style={styles.titleText}>Debug CodePush</Text>
          <Button
            title="codePush.sync"
            onPress={() => {
              codePush
                .sync({
                  installMode: codePush.InstallMode.IMMEDIATE,
                  updateDialog: {
                    title: 'Update available',
                    optionalUpdateMessage: 'Update available. Install?',
                    mandatoryUpdateMessage: 'Update available. Install?',
                    optionalIgnoreButtonLabel: 'Ignore',
                    mandatoryContinueButtonLabel: 'Continue',
                    appendReleaseDescription: true,
                    optionalInstallButtonLabel: 'Install',
                  },
                })
                .catch(error => {
                  console.error(error);
                  Alert.alert('Error', error.message ?? error);
                });
            }}
          />

          <Button
            title="codePush.getUpdateMetadata"
            onPress={() => {
              codePush
                .getUpdateMetadata()
                .then(result => {
                  Alert.alert('Result Label', result?.label ?? 'No label');
                })
                .catch(error => {
                  console.error(error);
                  Alert.alert('Error', error.message ?? error);
                });
            }}
          />

          <Button
            title="codePush.clearUpdates"
            onPress={() => {
              codePush.clearUpdates();
              Alert.alert('Updates cleared', 'Restart the app');
            }}
          />

          <View style={styles.spacer} />

          <View style={styles.section}>
            <Text style={styles.regularText}>
              __DEV__: {__DEV__ ? 'true' : 'false'}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

const styles = StyleSheet.create({
  backgroundStyle: {
    backgroundColor: 'white',
    flex: 1,
  },
  titleText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'black',
  },
  regularText: {
    fontSize: 16,
    color: 'black',
  },
  scrollContentContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  spacer: {
    height: 40,
  },
  section: {
    gap: 12,
    alignItems: 'center',
  },
});

function App(): React.JSX.Element {
  return <IssueDemo />;
}

const AppWithCodePush = codePush(App);

export default AppWithCodePush;
