import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  Text,
  TouchableOpacity,
  ListRenderItem,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useFocusEffect } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/types';
import { Launch } from '../types/spacex';
import { SpaceXApi, SpaceXApiError } from '../services/spacexApi';
import LaunchCard from '../components/LaunchCard';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import EmptyState from '../components/EmptyState';
import { Colors } from '../constants/colors';

type LaunchesListScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'LaunchesList'
>;

interface Props {
  navigation: LaunchesListScreenNavigationProp;
}

const ITEMS_PER_PAGE = 20;

export default function LaunchesListScreen({ navigation }: Props) {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [filteredLaunches, setFilteredLaunches] = useState<Launch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreData, setHasMoreData] = useState(true);
  
  const currentOffset = useRef(0);
  const isSearching = useRef(false);

  const loadLaunches = useCallback(
    async (offset = 0, isRefresh = false) => {
      try {
        if (isRefresh) {
          setRefreshing(true);
        } else if (offset === 0) {
          setLoading(true);
        } else {
          setLoadingMore(true);
        }

        setError(null);

        const data = await SpaceXApi.getLaunches({
          limit: ITEMS_PER_PAGE,
          offset,
          sort: 'desc',
        });

        if (isRefresh || offset === 0) {
          setLaunches(data);
          currentOffset.current = data.length;
        } else {
          setLaunches((prev) => [...prev, ...data]);
          currentOffset.current += data.length;
        }

        setHasMoreData(data.length === ITEMS_PER_PAGE);
      } catch (err) {
        console.error('Error loading launches:', err);
        setError(
          err instanceof SpaceXApiError
            ? err.message
            : 'Failed to load launches. Please try again.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    []
  );

  const searchLaunches = useCallback(async (query: string) => {
    if (!query.trim()) return;

    try {
      isSearching.current = true;
      setLoading(true);
      setError(null);

      const data = await SpaceXApi.searchLaunches(query, {
        limit: 100, // Higher limit for search results
      });

      setFilteredLaunches(data);
    } catch (err) {
      console.error('Error searching launches:', err);
      setError(
        err instanceof SpaceXApiError
          ? err.message
          : 'Failed to search launches. Please try again.'
      );
    } finally {
      setLoading(false);
      isSearching.current = false;
    }
  }, []);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);

      if (!query.trim()) {
        setFilteredLaunches([]);
        if (launches.length === 0) {
          loadLaunches(0);
        }
        return;
      }

      // Debounce search
      const timeoutId = setTimeout(() => {
        searchLaunches(query);
      }, 500);

      return () => clearTimeout(timeoutId);
    },
    [launches.length, loadLaunches, searchLaunches]
  );

  const handleRefresh = useCallback(() => {
    if (searchQuery.trim()) {
      searchLaunches(searchQuery);
    } else {
      loadLaunches(0, true);
    }
  }, [searchQuery, loadLaunches, searchLaunches]);

  const handleLoadMore = useCallback(() => {
    if (
      !loadingMore &&
      !isSearching.current &&
      hasMoreData &&
      !searchQuery.trim()
    ) {
      loadLaunches(currentOffset.current);
    }
  }, [loadingMore, hasMoreData, searchQuery, loadLaunches]);

  const handleLaunchPress = useCallback(
    (launch: Launch) => {
      navigation.navigate('LaunchDetails', { launch });
    },
    [navigation]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setFilteredLaunches([]);
    if (launches.length === 0) {
      loadLaunches(0);
    }
  }, [launches.length, loadLaunches]);

  const displayedLaunches = useMemo(() => {
    return searchQuery.trim() ? filteredLaunches : launches;
  }, [searchQuery, filteredLaunches, launches]);

  const keyExtractor = useCallback((item: Launch) => item.id, []);

  const renderLaunchCard: ListRenderItem<Launch> = useCallback(
    ({ item }) => (
      <LaunchCard launch={item} onPress={handleLaunchPress} />
    ),
    [handleLaunchPress]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingState message="Loading more launches..." size="small" />
      </View>
    );
  }, [loadingMore]);

  useFocusEffect(
    useCallback(() => {
      if (launches.length === 0 && !searchQuery.trim()) {
        loadLaunches(0);
      }
    }, [launches.length, searchQuery, loadLaunches])
  );

  if (loading && displayedLaunches.length === 0) {
    return <LoadingState message="Loading SpaceX launches..." />;
  }

  if (error && displayedLaunches.length === 0) {
    return (
      <ErrorState
        message={error}
        onRetry={() => {
          if (searchQuery.trim()) {
            searchLaunches(searchQuery);
          } else {
            loadLaunches(0);
          }
        }}
      />
    );
  }

  if (displayedLaunches.length === 0) {
    if (searchQuery.trim()) {
      return (
        <View style={styles.container}>
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search launches..."
              value={searchQuery}
              onChangeText={handleSearch}
              autoCorrect={false}
              autoCapitalize="none"
            />
            <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>
          <EmptyState
            title="No launches found"
            message={`No launches found for "${searchQuery}". Try a different search term.`}
            actionLabel="Clear search"
            onAction={clearSearch}
          />
        </View>
      );
    }

    return (
      <EmptyState
        title="No launches available"
        message="There are no SpaceX launches to display."
        actionLabel="Retry"
        onAction={() => loadLaunches(0)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search launches..."
          value={searchQuery}
          onChangeText={handleSearch}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.trim() && (
          <TouchableOpacity style={styles.clearButton} onPress={clearSearch}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={displayedLaunches}
        keyExtractor={keyExtractor}
        renderItem={renderLaunchCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    margin: 16,
    borderRadius: 10,
    paddingHorizontal: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  clearButton: {
    paddingLeft: 12,
  },
  clearButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 20,
  },
  footerLoader: {
    paddingVertical: 20,
  },
});